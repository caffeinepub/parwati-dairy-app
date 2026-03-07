import Map "mo:core/Map";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Float "mo:core/Float";
import Principal "mo:core/Principal";

module {
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
    orderDate : Int;
    status : Text;
    deliveryDate : ?Int;
    phoneNumber : Text;
    requestedDeliveryDate : ?Int;
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

  public type UserProfile = {
    name : Text;
    email : ?Text;
  };

  public type AdminCredentials = {
    username : Text;
    passwordHash : Text;
  };

  // Old actor type with previous record structure
  type OldActor = {
    nextOrderId : Nat;
    nextCustomerId : Nat;
    nextRecordId : Nat;
    adminCredentials : ?AdminCredentials;
    orders : Map.Map<Nat, Order>;
    deliveries : Map.Map<Nat, Delivery>;
    regularCustomers : Map.Map<Nat, RegularCustomer>;
    dailyOrderRecords : Map.Map<Nat, DailyOrderRecord>;
    userProfiles : Map.Map<Principal, UserProfile>;
    customerOwnership : Map.Map<Nat, Principal>;
  };

  // New actor type with updated AdminCredentials structure
  type NewActor = {
    nextOrderId : Nat;
    nextCustomerId : Nat;
    nextRecordId : Nat;
    adminCredentials : ?AdminCredentials;
    orders : Map.Map<Nat, Order>;
    deliveries : Map.Map<Nat, Delivery>;
    regularCustomers : Map.Map<Nat, RegularCustomer>;
    dailyOrderRecords : Map.Map<Nat, DailyOrderRecord>;
    userProfiles : Map.Map<Principal, UserProfile>;
    customerOwnership : Map.Map<Nat, Principal>;
  };

  public func run(old : OldActor) : NewActor {
    {
      nextOrderId = old.nextOrderId;
      nextCustomerId = old.nextCustomerId;
      nextRecordId = old.nextRecordId;
      adminCredentials = old.adminCredentials;
      orders = old.orders;
      deliveries = old.deliveries;
      regularCustomers = old.regularCustomers;
      dailyOrderRecords = old.dailyOrderRecords;
      userProfiles = old.userProfiles;
      customerOwnership = old.customerOwnership;
    };
  };
};
