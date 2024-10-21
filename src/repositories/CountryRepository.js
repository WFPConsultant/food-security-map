import { Country } from '../models/Country';

class CountryRepository {
  async fetchCountries() {
    const response = await fetch('https://api.hungermapdata.org/v1/foodsecurity/country');
    const data = await response.json();
    return data.body.countries.map(country => 
      new Country(country.country.iso3, country.country.name, country.metrics)
    );
  }
}

export default CountryRepository;