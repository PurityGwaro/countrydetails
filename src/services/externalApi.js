// Fetch data from external APIs (RestCountries & Exchange Rates)
const RestCountriesAPI = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
const ExchangeRateAPI = "https://open.er-api.com/v6/latest/USD"

//  Fetch all countries from RestCountries API
const fetchCountriesData = async () => {
    try {
        const response = await fetch(RestCountriesAPI);

        if (!response.ok) {
            throw new Error(`RestCountries API failed with status ${response.status}`);
        }

        const countries = await response.json();
        return countries;
    } catch (error) {
        console.error("Error fetching countries data:", error);
         throw new Error('Could not fetch data from RestCountries API');
    }
}

// Fetch exchange rates from Exchange Rate API
const fetchExchangeRates = async () => {
    try {
        const response = await fetch(ExchangeRateAPI);

        if (!response.ok) {
            throw new Error(`Exchange Rate API failed with status ${response.status}`);
        }

        const exchangeRates = await response.json();
        return exchangeRates.rates;
    } catch (error) {
        console.error("Error fetching exchange rates:", error);
        throw new Error('Could not fetch data from Exchange Rate API');
    }
}

module.exports = {
    fetchCountriesData,
    fetchExchangeRates
}
        