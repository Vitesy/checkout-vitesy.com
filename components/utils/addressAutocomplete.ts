import { Loader } from "@googlemaps/js-api-loader"

const STREET_NUMBER_BEFORE_COUNTRIES = [
  "US",
  "CA",
  "BE",
  "FR",
  "SK",
  "CZ",
  "HU",
  "PL",
  "SE",
  "FI",
]

const setupAutocomplete = (inputId, handlePlaceChanged) => {
  const loader = new Loader({
    apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    libraries: ["places"],
  })

  loader.load().then(() => {
    const input = document.getElementById(inputId)
    if (input) {
      const autocomplete = new google.maps.places.Autocomplete(input)
      autocomplete.addListener("place_changed", () => {
        const selectedPlace = autocomplete.getPlace()
        if (selectedPlace) {
          const addressComponents = selectedPlace.address_components || []
          const newAutocompleteAddress = {}

          const countryComponent = addressComponents.find((component) =>
            component.types.includes("country")
          )
          const selectedCountryCode = countryComponent?.short_name || ""
          newAutocompleteAddress.country_code = selectedCountryCode
          newAutocompleteAddress.line_1 = ""

          handlePlaceChanged(newAutocompleteAddress)

          setTimeout(() => {
            let route = ""
            let street_number = ""
            addressComponents.forEach((component) => {
              switch (component.types[0]) {
                case "route":
                  route = component.long_name
                  break
                case "street_number":
                  street_number = component.long_name
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

            let line_1 = `${route} ${street_number}`
            if (STREET_NUMBER_BEFORE_COUNTRIES.includes(selectedCountryCode)) {
              line_1 = `${street_number} ${route}`
            }
            newAutocompleteAddress.line_1 = line_1.trim()

            handlePlaceChanged(newAutocompleteAddress)
          }, 100)
        }
      })
    }
  })
}

export default setupAutocomplete
