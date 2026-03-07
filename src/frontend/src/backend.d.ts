import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface http_request_result {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export interface Product {
    id: bigint;
    name: string;
    quantity: bigint;
    price: bigint;
}
export interface DailyOrderRecord {
    quantityDelivered: number;
    date: string;
    amountCharged: number;
    notes?: string;
    recordId: bigint;
    customerId: bigint;
}
export interface TransformationOutput {
    status: bigint;
    body: Uint8Array;
    headers: Array<http_header>;
}
export type Time = bigint;
export interface TransformationInput {
    context: Uint8Array;
    response: http_request_result;
}
export interface Delivery {
    deliveryDate: Time;
    deliveryTime: string;
    orderId: bigint;
}
export interface RegularCustomer {
    pricePerLitre: number;
    dailyMilkQuantity: number;
    name: string;
    lastPaymentDate?: string;
    isActive: boolean;
    totalAmountDue: number;
    address: string;
    customerId: bigint;
    phone: string;
    amountReceived: number;
}
export interface Order {
    id: bigint;
    requestedDeliveryDate?: Time;
    status: string;
    deliveryDate?: Time;
    orderDate: Time;
    quantity: bigint;
    customerId: bigint;
    phoneNumber: string;
    product: Product;
}
export interface UserProfile {
    name: string;
    email?: string;
}
export interface http_header {
    value: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDailyOrderRecord(customerId: bigint, date: string, quantityDelivered: number, amountCharged: number, notes: string | null): Promise<bigint>;
    addRegularCustomer(name: string, phone: string, address: string, dailyMilkQuantity: number, pricePerLitre: number): Promise<bigint>;
    adminLogin(username: string, passwordHash: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelOrder(orderId: bigint): Promise<boolean>;
    changeAdminCredentials(oldPasswordHash: string, newUsername: string, newPasswordHash: string): Promise<boolean>;
    deleteDailyOrderRecord(recordId: bigint): Promise<boolean>;
    getAllDailyOrderRecords(): Promise<Array<DailyOrderRecord>>;
    getAllOrders(): Promise<Array<Order>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyOrderRecordsByCustomer(customerId: bigint): Promise<Array<DailyOrderRecord>>;
    getDeliverySchedule(orderId: bigint): Promise<Delivery | null>;
    getOrderHistory(customerId: bigint): Promise<Array<Order>>;
    getRegularCustomers(): Promise<Array<RegularCustomer>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    hasAdminCredentials(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(customerId: bigint, product: Product, quantity: bigint, phoneNumber: string, requestedDeliveryDate: Time | null): Promise<bigint>;
    recordDailyDelivery(customerId: bigint): Promise<boolean>;
    recordPayment(customerId: bigint, amount: number, paymentDate: string): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scheduleDelivery(orderId: bigint, deliveryDate: Time, deliveryTime: string): Promise<boolean>;
    setAdminCredentials(username: string, passwordHash: string): Promise<boolean>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<boolean>;
    updateRegularCustomer(customerId: bigint, name: string, phone: string, address: string, dailyMilkQuantity: number, pricePerLitre: number, isActive: boolean): Promise<boolean>;
}
