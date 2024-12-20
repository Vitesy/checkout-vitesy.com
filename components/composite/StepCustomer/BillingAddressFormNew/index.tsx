import { Address } from "@commercelayer/sdk"
import { useContext, useEffect, useState } from "react"
import styled from "styled-components"
import tw from "twin.macro"

import { ShippingToggleProps } from "components/composite/StepCustomer"
import { AddressInputGroup } from "components/composite/StepCustomer/AddressInputGroup"
import { AppContext } from "components/data/AppProvider"
import { useSettingsOrInvalid } from "components/hooks/useSettingsOrInvalid"
import setupAutocomplete from "components/utils/addressAutocomplete"

interface Props {
  billingAddress: NullableType<Address>
  openShippingAddress: (props: ShippingToggleProps) => void
}

export const BillingAddressFormNew: React.FC<Props> = ({
  billingAddress,
  openShippingAddress,
}: Props) => {
  const appCtx = useContext(AppContext)
  const { settings } = useSettingsOrInvalid()

  if (!appCtx) {
    return null
  }
  // if (!appCtx || !settings) {
  //   return null
  // }

  const [autocompleteAddress, setAutocompleteAddress] = useState({
    line_1: billingAddress?.line_1 || "",
    line_2: billingAddress?.line_2 || "",
    city: billingAddress?.city || "",
    country_code: billingAddress?.country_code || "",
    state_code: billingAddress?.state_code || "",
    zip_code: billingAddress?.zip_code || "",
  })

  useEffect(() => {
    setupAutocomplete(
      "billing_address_line_1",
      (selectedPlace: Partial<typeof autocompleteAddress> = {}) => {
        setAutocompleteAddress({
          ...autocompleteAddress,
          ...selectedPlace,
        })
      }
    )
  }, [])

  const { requiresBillingInfo } = appCtx

  const countries = settings?.config?.checkout?.billing_countries
  const states = settings?.config?.checkout?.billing_states
  const defaultCountry = settings?.config?.checkout?.default_country

  return (
    <Wrapper>
      <Grid>
        {requiresBillingInfo && (
          <AddressInputGroup
            fieldName="billing_address_company"
            resource="billing_address"
            type="text"
            required={true}
            value={billingAddress?.company || ""}
          />
        )}
        {requiresBillingInfo && (
          <AddressInputGroup
            fieldName="billing_address_billing_info"
            resource="billing_address"
            type="text"
            value={billingAddress?.billing_info || ""}
          />
        )}
      </Grid>
      <Grid>
        <AddressInputGroup
          fieldName="billing_address_first_name"
          resource="billing_address"
          type="text"
          value={billingAddress?.first_name || ""}
        />
        <AddressInputGroup
          fieldName="billing_address_last_name"
          resource="billing_address"
          type="text"
          value={billingAddress?.last_name || ""}
        />
      </Grid>
      <AddressInputGroup
        fieldName="billing_address_line_1"
        resource="billing_address"
        type="text"
        value={autocompleteAddress?.line_1 || ""}
      />
      <AddressInputGroup
        fieldName="billing_address_line_2"
        resource="billing_address"
        required={false}
        type="text"
        value={autocompleteAddress?.line_2 || ""}
      />
      <Grid>
        <AddressInputGroup
          fieldName="billing_address_city"
          resource="billing_address"
          type="text"
          value={autocompleteAddress?.city || ""}
        />
        <AddressInputGroup
          fieldName="billing_address_country_code"
          resource="billing_address"
          type="text"
          // @ts-expect-error missing type
          countries={countries}
          defaultCountry={defaultCountry}
          openShippingAddress={openShippingAddress}
          value={autocompleteAddress?.country_code || ""}
        />
      </Grid>
      <Grid>
        <AddressInputGroup
          fieldName="billing_address_state_code"
          resource="billing_address"
          // @ts-expect-error missing type
          states={states}
          type="text"
          value={autocompleteAddress?.state_code || ""}
        />
        <AddressInputGroup
          fieldName="billing_address_zip_code"
          resource="billing_address"
          type="text"
          value={autocompleteAddress?.zip_code || ""}
        />
      </Grid>
      <AddressInputGroup
        fieldName="billing_address_phone"
        resource="billing_address"
        type="tel"
        value={billingAddress?.phone || ""}
      />
    </Wrapper>
  )
}

const Wrapper = styled.div`
  ${tw`mt-0`}
`

const Grid = styled.div`
  ${tw`grid lg:grid-cols-2 lg:gap-4`}
`