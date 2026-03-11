import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import AccessControl "authorization/access-control";

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

  public type AdminCredentials = {
    username : Text;
    passwordHash : Text;
  };

  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  stable var nextOrderId = 0;
  stable var nextCustomerId = 0;
  stable var nextRecordId = 0;
  // Default credentials: username=pratap, password=Dairy@2024
  stable var adminCredentials : ?AdminCredentials = ?{
    username = "pratap";
    passwordHash = "Dairy@2024";
  };

  let orders = Map.empty<Nat, Order>();
  let deliveries = Map.empty<Nat, Delivery>();
  let regularCustomers = Map.empty<Nat, RegularCustomer>();
  let dailyOrderRecords = Map.empty<Nat, DailyOrderRecord>();

  let accessControlState = AccessControl.initState();
  let customerOwnership = Map.empty<Nat, Principal>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  // Fast query for checking if admin credentials exist
  public query func hasAdminCredentials() : async Bool {
    adminCredentials != null;
  };

  // Update call for login to always read fresh state
  public shared func adminLogin(username : Text, password : Text) : async Bool {
    switch (adminCredentials) {
      case (null) { false };
      case (?credentials) {
        credentials.username == username and credentials.passwordHash == password;
      };
    };
  };

  public query func getAdminUsername() : async Text {
    switch (adminCredentials) {
      case (null) { "" };
      case (?creds) { creds.username };
    };
  };

  // Only allow setup if no admin exists; since defaults are pre-set, this
  // effectively only runs after an explicit resetAdminPassword that set it to null,
  // or for brand new canisters. Use resetAdminPassword("5714",...) to change creds.
  public shared func setAdminCredentials(username : Text, password : Text) : async Bool {
    switch (adminCredentials) {
      case (?_) { false }; // Admin already exists
      case (null) {
        adminCredentials := ?{ username; passwordHash = password };
        true;
      };
    };
  };

  public shared func changeAdminCredentials(
    oldPassword : Text,
    newUsername : Text,
    newPassword : Text,
  ) : async Bool {
    switch (adminCredentials) {
      case (null) { false };
      case (?credentials) {
        if (credentials.passwordHash == oldPassword) {
          adminCredentials := ?{
            username = newUsername;
            passwordHash = newPassword;
          };
          true;
        } else { false };
      };
    };
  };

  public shared func resetAdminPassword(
    verificationCode : Text,
    newUsername : Text,
    newPassword : Text,
  ) : async Bool {
    if (verificationCode != "5714") {
      return false;
    };
    adminCredentials := ?{
      username = newUsername;
      passwordHash = newPassword;
    };
    true;
  };

  // Verify admin helper (used internally)
  func isValidAdmin(password : Text) : Bool {
    switch (adminCredentials) {
      case (null) { false };
      case (?creds) { creds.passwordHash == password };
    };
  };

  public shared func placeOrder(
    customerId : Nat,
    product : Product,
    quantity : Nat,
    phoneNumber : Text,
    requestedDeliveryDate : ?Time.Time,
  ) : async Nat {
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
    orderId;
  };

  public shared func scheduleDelivery(
    adminPassword : Text,
    orderId : Nat,
    deliveryDate : Time.Time,
    deliveryTime : Text,
  ) : async Bool {
    if (not isValidAdmin(adminPassword)) { return false };
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let newDelivery : Delivery = {
          orderId;
          deliveryDate;
          deliveryTime;
        };
        deliveries.add(orderId, newDelivery);
        orders.add(orderId, { order with deliveryDate = ?deliveryDate });
        true;
      };
    };
  };

  public query func getOrderHistory(customerId : Nat) : async [Order] {
    orders.values().filter(func(o) { o.customerId == customerId }).toArray();
  };

  public query func getAllOrders(adminPassword : Text) : async [Order] {
    if (not isValidAdmin(adminPassword)) { return [] };
    orders.values().toArray();
  };

  public query func getDeliverySchedule(orderId : Nat) : async ?Delivery {
    deliveries.get(orderId);
  };

  public shared func updateOrderStatus(
    adminPassword : Text,
    orderId : Nat,
    newStatus : Text,
  ) : async Bool {
    if (not isValidAdmin(adminPassword)) { return false };
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        orders.add(orderId, { order with status = newStatus });
        true;
      };
    };
  };

  public shared func cancelOrder(orderId : Nat) : async Bool {
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        orders.add(orderId, { order with status = "Canceled" });
        true;
      };
    };
  };

  public shared func addRegularCustomer(
    adminPassword : Text,
    name : Text,
    phone : Text,
    address : Text,
    dailyMilkQuantity : Float,
    pricePerLitre : Float,
  ) : async Nat {
    if (not isValidAdmin(adminPassword)) { return 0 };
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

  public query func getRegularCustomers(adminPassword : Text) : async [RegularCustomer] {
    if (not isValidAdmin(adminPassword)) { return [] };
    regularCustomers.values().toArray();
  };

  public shared func updateRegularCustomer(
    adminPassword : Text,
    customerId : Nat,
    name : Text,
    phone : Text,
    address : Text,
    dailyMilkQuantity : Float,
    pricePerLitre : Float,
    isActive : Bool,
  ) : async Bool {
    if (not isValidAdmin(adminPassword)) { return false };
    switch (regularCustomers.get(customerId)) {
      case (null) { false };
      case (?customer) {
        regularCustomers.add(customerId, {
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
        });
        true;
      };
    };
  };

  public shared func recordDailyDelivery(adminPassword : Text, customerId : Nat) : async Bool {
    if (not isValidAdmin(adminPassword)) { return false };
    switch (regularCustomers.get(customerId)) {
      case (null) { false };
      case (?customer) {
        let dailyAmount = customer.dailyMilkQuantity * customer.pricePerLitre;
        regularCustomers.add(customerId, {
          customer with
          totalAmountDue = customer.totalAmountDue + dailyAmount;
        });
        true;
      };
    };
  };

  public shared func recordPayment(
    adminPassword : Text,
    customerId : Nat,
    amount : Float,
    paymentDate : Text,
  ) : async Bool {
    if (not isValidAdmin(adminPassword)) { return false };
    switch (regularCustomers.get(customerId)) {
      case (null) { false };
      case (?customer) {
        regularCustomers.add(customerId, {
          customer with
          amountReceived = customer.amountReceived + amount;
          lastPaymentDate = ?paymentDate;
          totalAmountDue = customer.totalAmountDue - amount;
        });
        true;
      };
    };
  };

  public shared func addDailyOrderRecord(
    adminPassword : Text,
    customerId : Nat,
    date : Text,
    quantityDelivered : Float,
    amountCharged : Float,
    notes : ?Text,
  ) : async Nat {
    if (not isValidAdmin(adminPassword)) { return 0 };
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

  public query func getDailyOrderRecordsByCustomer(customerId : Nat) : async [DailyOrderRecord] {
    dailyOrderRecords.values().filter(func(r) { r.customerId == customerId }).toArray();
  };

  public query func getAllDailyOrderRecords(adminPassword : Text) : async [DailyOrderRecord] {
    if (not isValidAdmin(adminPassword)) { return [] };
    dailyOrderRecords.values().toArray();
  };

  public shared func deleteDailyOrderRecord(adminPassword : Text, recordId : Nat) : async Bool {
    if (not isValidAdmin(adminPassword)) { return false };
    switch (dailyOrderRecords.get(recordId)) {
      case (null) { false };
      case (_) {
        dailyOrderRecords.remove(recordId);
        true;
      };
    };
  };
};
