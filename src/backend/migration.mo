import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type Product = {
    id : Nat;
    name : Text;
    quantity : Nat;
    price : Nat;
  };

  type Order = {
    id : Nat;
    customerId : Nat;
    product : Product;
    quantity : Nat;
    orderDate : Int;
    status : Text;
    deliveryDate : ?Int;
  };

  type OldActor = {
    orders : Map.Map<Nat, Order>;
  };

  type NewOrder = {
    id : Nat;
    customerId : Nat;
    product : Product;
    quantity : Nat;
    orderDate : Int;
    status : Text;
    deliveryDate : ?Int;
    phoneNumber : Text;
  };

  type NewActor = {
    orders : Map.Map<Nat, NewOrder>;
  };

  public func run(old : OldActor) : NewActor {
    let newOrders = old.orders.map<Nat, Order, NewOrder>(
      func(_id, oldOrder) {
        { oldOrder with phoneNumber = "" };
      }
    );
    { orders = newOrders };
  };
};
