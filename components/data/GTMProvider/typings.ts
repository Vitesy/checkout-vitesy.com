export interface DataLayerItemProps {
  item_id: NullableType<string>
  item_name: NullableType<string>
  price?: NullableType<number>
  currency: NullableType<string>
  quantity: NullableType<number>

  item_category?: NullableType<string>
  item_brand?: NullableType<string>
  discount?: NullableType<number>
}

export interface EcommerceProps {
  coupon?: NullableType<string>
  currency?: NullableType<string>
  shipping?: NullableType<number>
  items?: (DataLayerItemProps | undefined)[]
  value?: NullableType<number>
  shipping_tier?: NullableType<string>
  transaction_id?: NullableType<string | number>
  payment_type?: NullableType<string>
  tax?: NullableType<number>

  order_id?: NullableType<string>
  net_value?: NullableType<number>
  discount_value?: NullableType<number>
  phone_number?: NullableType<string>
  first_name?: NullableType<string>
  surname?: NullableType<string>
}

export interface DataLayerProps {
  eventName:
  | "begin_checkout"
  | "add_shipping_info"
  | "add_payment_info"
  | "purchase"
  dataLayer: EcommerceProps
}
