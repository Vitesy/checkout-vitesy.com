import { LineItem, Order } from "@commercelayer/sdk"
import { createContext, useEffect, useContext, useRef } from "react"
import TagManager from "react-gtm-module"

import { AppContext } from "components/data/AppProvider"
import type { TypeAccepted } from "components/data/AppProvider/utils"
import { LINE_ITEMS_SHOPPABLE } from "components/utils/constants"

import { DataLayerItemProps, DataLayerProps } from "./typings"

interface GTMProviderData {
  fireAddShippingInfo: (order: Order) => void
  fireAddPaymentInfo: () => void
  firePurchase: () => void
}

export const GTMContext = createContext<GTMProviderData | null>(null)

interface GTMProviderProps {
  children: React.ReactNode
  gtmId: NullableType<string>
  skipBeginCheckout: boolean
}

export const GTMProvider: React.FC<GTMProviderProps> = ({
  children,
  gtmId,
  skipBeginCheckout,
}) => {
  const isFirstLoading = useRef(true)

  if (!gtmId) {
    return <>{children}</>
  }
  const ctx = useContext(AppContext)

  if (!ctx) {
    return <>{children}</>
  }

  const { order } = ctx

  useEffect(() => {
    if (isFirstLoading.current && gtmId != null && order != null) {
      isFirstLoading.current = false
      TagManager.initialize({ gtmId })
      if (!skipBeginCheckout) {
        fireBeginCheckout(order)
      }
    }
  }, [order])

  const pushDataLayer = ({ eventName, dataLayer }: DataLayerProps) => {
    try {
      TagManager.dataLayer({
        dataLayer: {
          event: eventName,
          ecommerce: dataLayer,
        },
      })
    } catch (error) {
      console.log(error)
    }
  }

  function productCategory(sku: string) {
    if (sku) {
      if (sku.includes("ET")) return "Eteria"
      if (sku.includes("NT")) return "Natede"
      if (sku.includes("SH")) return "Shelfy"
      else return "Other"
    } else {
      return "Other"
    }
  }

  const mapItemsToGTM = ({
    name,
    currency_code,
    sku_code,
    bundle_code,
    quantity,
    total_amount_float,
    discount_float,
  }: LineItem): DataLayerItemProps => {
    const itemCategory = productCategory(sku_code || bundle_code || "")

    return {
      item_id: sku_code || bundle_code,
      item_name: name,
      price: total_amount_float,
      currency: currency_code,
      quantity,
      item_category: itemCategory,
      item_brand: "Vitesy",
      discount: Math.abs(discount_float || 0) / (quantity || 1),
    }
  }

  const fireBeginCheckout = (order: Order) => {
    const lineItems = order.line_items?.filter((line_item) => {
      return LINE_ITEMS_SHOPPABLE.includes(line_item.item_type as TypeAccepted)
    })

    return pushDataLayer({
      eventName: "begin_checkout",
      dataLayer: {
        coupon: order?.coupon_code,
        currency: order?.currency_code,
        items: lineItems?.map(mapItemsToGTM),
        value: order?.total_amount_with_taxes_float,
        order_id: order?.id,
      },
    })
  }

  const fireAddShippingInfo = (order: Order) => {
    const shipments = order?.shipments

    shipments?.forEach((shipment) => {
      const lineItems = shipment.stock_line_items?.map(
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        (e) => e && mapItemsToGTM(e.line_item)
      )

      pushDataLayer({
        eventName: "add_shipping_info",
        dataLayer: {
          coupon: order?.coupon_code,
          currency: order?.currency_code,
          items: lineItems,
          // value: shipment.shipping_method?.price_amount_for_shipment_float,
          value: order?.total_amount_with_taxes_float,
          shipping_tier: shipment.shipping_method?.name,
          order_id: order?.id,
        },
      })
    })
  }

  const fireAddPaymentInfo = () => {
    const lineItems = order?.line_items?.filter((line_item) => {
      return LINE_ITEMS_SHOPPABLE.includes(line_item.item_type as TypeAccepted)
    })

    const paymentMethod = order?.payment_method

    return pushDataLayer({
      eventName: "add_payment_info",
      dataLayer: {
        coupon: order?.coupon_code,
        currency: order?.currency_code,
        items: lineItems?.map(mapItemsToGTM),
        // value: paymentMethod?.price_amount_float,
        value: order?.total_amount_with_taxes_float,
        payment_type: paymentMethod?.name,
        order_id: order?.id,
      },
    })
  }

  const firePurchase = () => {
    const lineItems = order?.line_items?.filter((line_item) => {
      return LINE_ITEMS_SHOPPABLE.includes(line_item.item_type as TypeAccepted)
    })

    const paymentMethod = order?.payment_method

    return pushDataLayer({
      eventName: "purchase",
      dataLayer: {
        coupon: order?.coupon_code,
        currency: order?.currency_code,
        items: lineItems?.map(mapItemsToGTM),
        transaction_id: order?.number,
        shipping: order?.shipping_amount_float,
        value: order?.total_amount_with_taxes_float,
        tax: order?.total_tax_amount_float,
        order_id: order?.id,
        net_value:
          order?.total_amount_with_taxes_float ||
          0 -
            ((order?.total_tax_amount_float || 0) +
              (order?.shipping_amount_float || 0)),
        discount_value: Math.abs(order?.discount_amount_float || 0),
        payment_type: paymentMethod?.name,
      },
    })
  }

  return (
    <GTMContext.Provider
      value={{
        fireAddShippingInfo,
        fireAddPaymentInfo,
        firePurchase,
      }}
    >
      {children}
    </GTMContext.Provider>
  )
}
