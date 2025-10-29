const RestCountriesAPI = "https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies"
const ExchangeRateAPI = "https://open.er-api.com/v6/latest/USD"

const fetchCountriesData = async () => {
    try {
        const response = await fetch(RestCountriesAPI);

        if (!response.ok) {
            throw new Error(`RestCountries API failed with status ${response.status}`);
        }

        const countries = await response.json();
        return countries;
    } catch (error) {
        throw new Error('Could not fetch data from RestCountries API');
    }
}

const fetchExchangeRates = async () => {
    try {
        const response = await fetch(ExchangeRateAPI);

        if (!response.ok) {
            throw new Error(`Exchange Rate API failed with status ${response.status}`);
        }

        const exchangeRates = await response.json();
        return exchangeRates.rates;
    } catch (error) {
        throw new Error('Could not fetch data from Exchange Rate API');
    }
}

module.exports = {
    fetchCountriesData,
    fetchExchangeRates
}
        