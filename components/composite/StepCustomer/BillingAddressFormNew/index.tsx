import { Address } from "@commercelayer/sdk"
import { Loader } from "@googlemaps/js-api-loader"
import { useContext, useState } from "react"
import styled from "styled-components"
import tw from "twin.macro"

import { ShippingToggleProps } from "components/composite/StepCustomer"
import { AddressInputGroup } from "components/composite/StepCustomer/AddressInputGroup"
import { AppContext } from "components/data/AppProvider"

interface Props {
  billingAddress: NullableType<Address>
  openShippingAddress: (props: ShippingToggleProps) => void
}

export const BillingAddressFormNew: React.FC<Props> = ({
  billingAddress,
  openShippingAddress,
}: Props) => {
  const appCtx = useContext(AppContext)

  if (!appCtx) {
    return null
  }

  const [autocompleteAddress, setAutocompleteAddress] = useState({
    line_1: billingAddress?.line_1 || "",
    line_2: billingAddress?.line_2 || "",
    city: billingAddress?.city || "",
    country_code: billingAddress?.country_code || "",
    state_code: billingAddress?.state_code || "",
    zip_code: billingAddress?.zip_code || "",
    // line_1: "",
    // line_2: "",
    // city: "",
    // country_code: "",
    // state_code: "",
    // zip_code: "",
  })

  const loader = new Loader({
    apiKey: "AIzaSyCGyK40kmxyQsrl_QcwrvptKj5bb5J1Q6U",
    libraries: ["places"],
  })
  loader.load().then(() => {
    const input = document.getElementById("billing_address_line_1")

    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input)

      autocomplete.addListener("place_changed", () => {
        const selectedPlace = autocomplete.getPlace()
        const addressComponents = selectedPlace.address_components || []

        if (selectedPlace) {
          const newAutocompleteAddress: Partial<typeof autocompleteAddress> = {}

          const countryComponent = addressComponents.find((component) =>
            component.types.includes("country")
          )
          const selectedCountryCode = countryComponent?.short_name || ""

          addressComponents.forEach((component) => {
            switch (component.types[0]) {
              case "street_number":
                newAutocompleteAddress.line_1 =
                  (newAutocompleteAddress.line_1 || "") +
                  component.long_name +
                  " "
                break
              case "route":
                newAutocompleteAddress.line_1 =
                  (newAutocompleteAddress.line_1 || "") + component.long_name
                break
              case "locality":
                newAutocompleteAddress.city = component.long_name
                break
              case "country":
                newAutocompleteAddress.country_code = component.short_name
                break
              case "administrative_area_level_1":
                if (selectedCountryCode !== "IT") {
                  newAutocompleteAddress.state_code = component.short_name
                }
                break
              case "administrative_area_level_2":
                if (selectedCountryCode === "IT") {
                  newAutocompleteAddress.state_code = component.short_name
                }
                break
              case "postal_code":
                newAutocompleteAddress.zip_code = component.long_name
                break
              default:
                break
            }
          })

          setAutocompleteAddress({
            ...autocompleteAddress,
            ...newAutocompleteAddress,
          })

          console.log(selectedPlace)
          console.log(newAutocompleteAddress)
          // console.log("billingAddress", billingAddress)
          // console.log("autocompleteAddress", autocompleteAddress)
        }
      })
    }
  })

  const { requiresBillingInfo } = appCtx

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
          openShippingAddress={openShippingAddress}
          value={autocompleteAddress?.country_code || ""}
        />
      </Grid>
      <Grid>
        <AddressInputGroup
          fieldName="billing_address_state_code"
          resource="billing_address"
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
