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
export interface Order {
    id: bigint;
    status: string;
    deliveryDate?: Time;
    orderDate: Time;
    quantity: bigint;
    customerId: bigint;
    phoneNumber: string;
    product: Product;
}
export interface Product {
    id: bigint;
    name: string;
    quantity: bigint;
    price: bigint;
}
export interface http_header {
    value: string;
    name: string;
}
export interface backendInterface {
    cancelOrder(orderId: bigint): Promise<boolean>;
    getDeliverySchedule(orderId: bigint): Promise<Delivery | null>;
    getOrderHistory(customerId: bigint): Promise<Array<Order>>;
    placeOrder(customerId: bigint, product: Product, quantity: bigint, phoneNumber: string): Promise<bigint>;
    scheduleDelivery(orderId: bigint, deliveryDate: Time, deliveryTime: string): Promise<boolean>;
    transform(input: TransformationInput): Promise<TransformationOutput>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<boolean>;
}
