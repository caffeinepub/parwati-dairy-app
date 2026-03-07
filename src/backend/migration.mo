import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Principal "mo:core/Principal";

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
    orderDate : Time.Time;
    status : Text;
    deliveryDate : ?Time.Time;
    phoneNumber : Text;
    requestedDeliveryDate : ?Time.Time;
  };

  type Delivery = {
    orderId : Nat;
    deliveryDate : Time.Time;
    deliveryTime : Text;
  };

  type RegularCustomer = {
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

  type DailyOrderRecord = {
    recordId : Nat;
    customerId : Nat;
    date : Text;
    quantityDelivered : Float;
    amountCharged : Float;
    notes : ?Text;
  };

  type UserProfile = {
    name : Text;
    email : ?Text;
  };

  type AdminCredentials = {
    username : Text;
    passwordHash : Text;
  };

  type Actor = {
    var nextOrderId : Nat;
    var nextCustomerId : Nat;
    var nextRecordId : Nat;
    var adminCredentials : ?AdminCredentials;
    orders : Map.Map<Nat, Order>;
    deliveries : Map.Map<Nat, Delivery>;
    regularCustomers : Map.Map<Nat, RegularCustomer>;
    dailyOrderRecords : Map.Map<Nat, DailyOrderRecord>;
    userProfiles : Map.Map<Principal, UserProfile>;
  };

  public func run(old : Actor) : Actor {
    old;
  };
};
