import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Order {
    id: bigint;
    status: string;
    orderDate: Time;
    quantity: bigint;
    customerId: bigint;
    product: Product;
}
export interface Product {
    id: bigint;
    name: string;
    quantity: bigint;
    price: bigint;
}
export interface Delivery {
    deliveryDate: Time;
    deliveryTime: string;
    orderId: bigint;
}
export interface backendInterface {
    cancelOrder(orderId: bigint): Promise<boolean>;
    getDeliverySchedule(orderId: bigint): Promise<Delivery | null>;
    getOrderHistory(customerId: bigint): Promise<Array<Order>>;
    placeOrder(customerId: bigint, product: Product, quantity: bigint): Promise<bigint>;
    scheduleDelivery(orderId: bigint, deliveryDate: Time, deliveryTime: string): Promise<boolean>;
    updateOrderStatus(orderId: bigint, newStatus: string): Promise<boolean>;
}
