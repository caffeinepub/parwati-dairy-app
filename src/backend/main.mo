import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";



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
  };

  public type Delivery = {
    orderId : Nat;
    deliveryDate : Time.Time;
    deliveryTime : Text;
  };

  let orders = Map.empty<Nat, Order>();
  let deliveries = Map.empty<Nat, Delivery>();
  var nextOrderId = 0;

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func sendOrderConfirmationSms(phoneNumber : Text, productName : Text, quantity : Nat, totalPrice : Nat, orderId : Nat) : async () {
    let message = "Thank you for your order! \nOrder ID: " # orderId.toText() # "\nProduct: " # productName # "\nQuantity: " # quantity.toText() # "\nTotal Price: $" # totalPrice.toText();
    let encodedMessage : Text = message;
    let smsGatewayUrl = "https://api.smsprovider.com/send?to=" # phoneNumber # "&message=" # encodedMessage;
    let _ = await OutCall.httpGetRequest(smsGatewayUrl, [], transform);
  };

  public shared ({ caller }) func placeOrder(customerId : Nat, product : Product, quantity : Nat, phoneNumber : Text) : async Nat {
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
    };

    orders.add(orderId, newOrder);
    nextOrderId += 1;

    let totalPrice = product.price * quantity;
    await sendOrderConfirmationSms(phoneNumber, product.name, quantity, totalPrice, orderId);

    orderId;
  };

  public shared ({ caller }) func scheduleDelivery(orderId : Nat, deliveryDate : Time.Time, deliveryTime : Text) : async Bool {
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
    let orderList = orders.values().filter(
      func(order) {
        order.customerId == customerId;
      }
    );
    orderList.toArray();
  };

  public query ({ caller }) func getDeliverySchedule(orderId : Nat) : async ?Delivery {
    deliveries.get(orderId);
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Nat, newStatus : Text) : async Bool {
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
    switch (orders.get(orderId)) {
      case (null) { false };
      case (?order) {
        let updatedOrder = { order with status = "Canceled" };
        orders.add(orderId, updatedOrder);
        true;
      };
    };
  };
};
