import Time "mo:core/Time";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Iter "mo:core/Iter";

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
  };

  public type Delivery = {
    orderId : Nat;
    deliveryDate : Time.Time;
    deliveryTime : Text;
  };

  let orders = Map.empty<Nat, Order>();
  let deliveries = Map.empty<Nat, Delivery>();
  var nextOrderId = 0;

  public shared ({ caller }) func placeOrder(customerId : Nat, product : Product, quantity : Nat) : async Nat {
    let orderId = nextOrderId;
    let newOrder : Order = {
      id = orderId;
      customerId;
      product;
      quantity;
      orderDate = Time.now();
      status = "Placed";
    };

    orders.add(orderId, newOrder);
    nextOrderId += 1;
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
        true;
      };
    };
  };

  public query ({ caller }) func getOrderHistory(customerId : Nat) : async [Order] {
    let orderList = orders.values().filter(
      func(order) {
        order.customerId == customerId
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
