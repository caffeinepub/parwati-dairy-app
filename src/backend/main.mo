import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Float "mo:core/Float";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Iter "mo:core/Iter";
import Text "mo:core/Text";
import Runtime "mo:core/Runtime";

actor {
  public type Product = {
    id : Nat;
    name : Text;
    quantity : Nat;
    price : Nat;
  };

  public type Order = {
    id : Nat;
    customerId : Nat;
    product : Product;
    quantity : Nat;
    orderDate : Time.Time;
    status : Text;
    deliveryDate : ?Time.Time;
    phoneNumber : Text;
    requestedDeliveryDate : ?Time.Time;
  };

  public type Delivery = {
    orderId : Nat;
    deliveryDate : Time.Time;
    deliveryTime : Text;
  };

  public type RegularCustomer = {
    customerId : Nat;
    name : Text;
    phone : Text;
    address : Text;
    dailyMilkQuantity : Float;
    pricePerLitre : Float;
    totalAmountDue : Float;
    amountReceived : Float;
    lastPaymentDate : ?Text;
    isActive : Bool;
  };

  public type DailyOrderRecord = {
    recordId : Nat;
    customerId : Nat;
    date : Text;
    quantityDelivered : Float;
    amountCharged : Float;
    notes : ?Text;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  public type AdminCredentials = {
    username : Text;
    passwordHash : Text;
  };

  stable var nextOrderId = 0;
  stable var nextCustomerId = 0;
  stable var nextRecordId = 0;
  stable var adminCredentials : ?AdminCredentials = null;

  let orders = Map.empty<Nat, Order>();
  let deliveries = Map.empty<Nat, Delivery>();
  let regularCustomers = Map.empty<Nat, RegularCustomer>();
  let dailyOrderRecords = Map.empty<Nat, DailyOrderRecord>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Map to track which Principal owns which customerId
  let customerOwnership = Map.empty<Nat, Principal>();

  func sendOrderConfirmationSms(
    phoneNumber : Text,
    productName : Text,
    quantity : Nat,
    totalPrice : Nat,
    orderId : Nat,
  ) : async () {
    let message = "Thank you for your order! \nOrder ID: " # orderId.toText() # "\nProduct: " # productName # "\nQuantity: " # quantity.toText() # "\nTotal Price: $" # totalPrice.toText();
    let encodedMessage : Text = message;
    let smsGatewayUrl = "https://api.smsprovider.com/send?to=" # phoneNumber # "&message=" # encodedMessage;
    let _ = await OutCall.httpGetRequest(smsGatewayUrl, [], transform);
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public query func hasAdminCredentials() : async Bool {
    adminCredentials != null;
  };

  public shared ({ caller }) func setAdminCredentials(username : Text, passwordHash : Text) : async Bool {
    switch (adminCredentials) {
      case (null) {
        adminCredentials := ?{ username; passwordHash };
        true;
      };
      case (_) { false };
    };
  };

  public query func adminLogin(username : Text, passwordHash : Text) : async Bool {
    switch (adminCredentials) {
      case (null) { false };
      case (?credentials) {
        credentials.username == username and credentials.passwordHash == passwordHash;
      };
    };
  };

  public shared ({ caller }) func changeAdminCredentials(
    oldPasswordHash : Text,
    newUsername : Text,
    newPasswordHash : Text,
  ) : async Bool {
    switch (adminCredentials) {
      case (null) { false };
      case (?credentials) {
        if (credentials.passwordHash == oldPasswordHash) {
          adminCredentials := ?{
            username = newUsername;
            passwordHash = newPasswordHash;
          };
          true;
        } else { false };
      };
    };
  };

  public shared ({ caller }) func resetAdminPassword(
    verificationCode : Text,
    newPasswordHash : Text,
  ) : async Bool {
    if (verificationCode != "5714") {
      return false;
    };
    switch (adminCredentials) {
      case (null) { false };
      case (?credentials) {
        adminCredentials := ?{
          username = credentials.username;
          passwordHash = newPasswordHash;
        };
        true;
      };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func placeOrder(
    customerId : Nat,
    product : Product,
    quantity : Nat,
    phoneNumber : Text,
    requestedDeliveryDate : ?Time.Time,
  ) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can place orders");
    };

    // Track customer ownership
    switch (customerOwnership.get(customerId)) {
      case (null) {
        customerOwnership.add(customerId, caller);
      };
      case (?owner) {
        if (owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Cannot place order for another customer");
        };
      };
    };

    let orderId = nextOrderId;
    let newOrder : Order = {
      id = orderId;
      customerId;
      product;
      quantity;
      orderDate = Time.now();
      status = "Placed";
      deliveryDate = null;
      phoneNumber;
      requestedDeliveryDate;
    };

    orders.add(orderId, newOrder);
    nextOrderId += 1;

    let totalPrice = product.price * quantity;
    await sendOrderConfirmationSms(phoneNumber, product.name, quantity, totalPrice, orderId);

    orderId;
  };

  public shared ({ caller }) func scheduleDelivery(
    orderId : Nat,
    deliveryDate : Time.Time,
    deliveryTime : Text,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can schedule deliveries");
    };

    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let newDelivery : Delivery = {
          orderId;
          deliveryDate;
          deliveryTime;
        };
        deliveries.add(orderId, newDelivery);

        let updatedOrder = { order with deliveryDate = ?deliveryDate };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public query ({ caller }) func getOrderHistory(customerId : Nat) : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view order history");
    };

    // Verify ownership: user can only view their own orders, admin can view all
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (customerOwnership.get(customerId)) {
        case (null) {
          Runtime.trap("Unauthorized: Cannot view orders for this customer");
        };
        case (?owner) {
          if (owner != caller) {
            Runtime.trap("Unauthorized: Can only view your own order history");
          };
        };
      };
    };

    let orderList = orders.values().filter(
      func(order) {
        order.customerId == customerId;
      }
    );
    orderList.toArray();
  };

  public query ({ caller }) func getAllOrders() : async [Order] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public query ({ caller }) func getDeliverySchedule(orderId : Nat) : async ?Delivery {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view delivery schedules");
    };

    // Verify ownership: user can only view delivery for their own orders
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (orders.get(orderId)) {
        case (null) { };
        case (?order) {
          switch (customerOwnership.get(order.customerId)) {
            case (null) {
              Runtime.trap("Unauthorized: Cannot view delivery for this order");
            };
            case (?owner) {
              if (owner != caller) {
                Runtime.trap("Unauthorized: Can only view delivery for your own orders");
              };
            };
          };
        };
      };
    };

    deliveries.get(orderId);
  };

  public shared ({ caller }) func updateOrderStatus(
    orderId : Nat,
    newStatus : Text,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };

    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let updatedOrder = { order with status = newStatus };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Nat) : async Bool {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel orders");
    };

    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        // Verify ownership: user can only cancel their own orders
        if (not AccessControl.isAdmin(accessControlState, caller)) {
          switch (customerOwnership.get(order.customerId)) {
            case (null) {
              Runtime.trap("Unauthorized: Cannot cancel this order");
            };
            case (?owner) {
              if (owner != caller) {
                Runtime.trap("Unauthorized: Can only cancel your own orders");
              };
            };
          };
        };

        let updatedOrder = { order with status = "Canceled" };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };

  public shared ({ caller }) func addRegularCustomer(
    name : Text,
    phone : Text,
    address : Text,
    dailyMilkQuantity : Float,
    pricePerLitre : Float,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add regular customers");
    };

    let customerId = nextCustomerId;
    let newCustomer : RegularCustomer = {
      customerId;
      name;
      phone;
      address;
      dailyMilkQuantity;
      pricePerLitre;
      totalAmountDue = 0.0;
      amountReceived = 0.0;
      lastPaymentDate = null;
      isActive = true;
    };

    regularCustomers.add(customerId, newCustomer);
    nextCustomerId += 1;
    customerId;
  };

  public query ({ caller }) func getRegularCustomers() : async [RegularCustomer] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view regular customers");
    };
    regularCustomers.values().toArray();
  };

  public shared ({ caller }) func updateRegularCustomer(
    customerId : Nat,
    name : Text,
    phone : Text,
    address : Text,
    dailyMilkQuantity : Float,
    pricePerLitre : Float,
    isActive : Bool,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update regular customers");
    };

    switch (regularCustomers.get(customerId)) {
      case (null) { false };
      case (?customer) {
        let updatedCustomer : RegularCustomer = {
          customerId;
          name;
          phone;
          address;
          dailyMilkQuantity;
          pricePerLitre;
          totalAmountDue = customer.totalAmountDue;
          amountReceived = customer.amountReceived;
          lastPaymentDate = customer.lastPaymentDate;
          isActive;
        };
        regularCustomers.add(customerId, updatedCustomer);
        true;
      };
    };
  };

  public shared ({ caller }) func recordDailyDelivery(customerId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record daily deliveries");
    };

    switch (regularCustomers.get(customerId)) {
      case (null) { false };
      case (?customer) {
        let dailyAmount = customer.dailyMilkQuantity * customer.pricePerLitre;
        let updatedCustomer = {
          customer with
          totalAmountDue = customer.totalAmountDue + dailyAmount;
        };
        regularCustomers.add(customerId, updatedCustomer);
        true;
      };
    };
  };

  public shared ({ caller }) func recordPayment(
    customerId : Nat,
    amount : Float,
    paymentDate : Text,
  ) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can record payments");
    };

    switch (regularCustomers.get(customerId)) {
      case (null) { false };
      case (?customer) {
        let updatedCustomer = {
          customer with
          amountReceived = customer.amountReceived + amount;
          lastPaymentDate = ?paymentDate;
          totalAmountDue = customer.totalAmountDue - amount;
        };
        regularCustomers.add(customerId, updatedCustomer);
        true;
      };
    };
  };

  public shared ({ caller }) func addDailyOrderRecord(
    customerId : Nat,
    date : Text,
    quantityDelivered : Float,
    amountCharged : Float,
    notes : ?Text,
  ) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add records");
    };

    let recordId = nextRecordId;
    let newRecord : DailyOrderRecord = {
      recordId;
      customerId;
      date;
      quantityDelivered;
      amountCharged;
      notes;
    };

    dailyOrderRecords.add(recordId, newRecord);
    nextRecordId += 1;
    recordId;
  };

  public query ({ caller }) func getDailyOrderRecordsByCustomer(customerId : Nat) : async [DailyOrderRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view daily order records");
    };

    // Verify ownership: user can only view their own records, admin can view all
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      switch (customerOwnership.get(customerId)) {
        case (null) {
          Runtime.trap("Unauthorized: Cannot view records for this customer");
        };
        case (?owner) {
          if (owner != caller) {
            Runtime.trap("Unauthorized: Can only view your own daily order records");
          };
        };
      };
    };

    dailyOrderRecords.values().toArray().filter(
      func(record) { record.customerId == customerId }
    );
  };

  public query ({ caller }) func getAllDailyOrderRecords() : async [DailyOrderRecord] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all records");
    };
    dailyOrderRecords.values().toArray();
  };

  public shared ({ caller }) func deleteDailyOrderRecord(recordId : Nat) : async Bool {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can delete records");
    };

    switch (dailyOrderRecords.get(recordId)) {
      case (null) { false };
      case (_) {
        dailyOrderRecords.remove(recordId);
        true;
      };
    };
  };
};
