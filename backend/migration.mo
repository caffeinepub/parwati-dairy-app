import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  public type OldActor = {
    orders : Map.Map<Nat, Order>;
    deliveries : Map.Map<Nat, Delivery>;
    regularCustomers : Map.Map<Nat, RegularCustomer>;
    nextOrderId : Nat;
    nextCustomerId : Nat;
  };

  public type NewActor = {
    orders : Map.Map<Nat, Order>;
    deliveries : Map.Map<Nat, Delivery>;
    regularCustomers : Map.Map<Nat, RegularCustomer>;
    dailyOrderRecords : Map.Map<Nat, DailyOrderRecord>;
    nextOrderId : Nat;
    nextCustomerId : Nat;
    nextRecordId : Nat;
  };

  public type Order = {
    id : Nat;
    customerId : Nat;
    product : Product;
    quantity : Nat;
    orderDate : Int;
    status : Text;
    deliveryDate : ?Int;
    phoneNumber : Text;
    requestedDeliveryDate : ?Int;
  };

  public type Product = {
    id : Nat;
    name : Text;
    quantity : Nat;
    price : Nat;
  };

  public type Delivery = {
    orderId : Nat;
    deliveryDate : Int;
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

  public func run(old : OldActor) : NewActor {
    {
      old with
      dailyOrderRecords = Map.empty<Nat, DailyOrderRecord>();
      nextRecordId = 0;
    };
  };
};
