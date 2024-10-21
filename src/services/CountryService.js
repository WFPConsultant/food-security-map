import CountryRepository from '../repositories/CountryRepository';

class CountryService {
    constructor(countryRepository) {
      this.countryRepository = countryRepository;
    }
  
    async getCountries() {
      return await this.countryRepository.fetchCountries();
    }



  getColorStops(countries) {
    return countries.map(country => {
      const prevalence = country.metrics.fcs.prevalence;
      let color = this.getColorBasedOnPrevalence(prevalence);
      return [country.iso3, color];
    });
  }

  getColorBasedOnPrevalence(prevalence) {
    if (prevalence > 0.5) return '#c44cc0';
    else if (prevalence > 0.4) return '#dd5ca8';
    else if (prevalence > 0.3) return '#ec739b';
    else if (prevalence > 0.2) return '#f1a8a5';
    else if (prevalence > 0.1) return '#f4bfb6';
    return '#f8d5cc'; // Default color
  }

  prepareLegendData() {
    return [
      { prevalence: '> 50%', color: '#c44cc0' },
      { prevalence: '> 40%', color: '#dd5ca8' },
      { prevalence: '> 30%', color: '#ec739b' },
      { prevalence: '> 20%', color: '#f1a8a5' },
      { prevalence: '> 10%', color: '#f4bfb6' },
      { prevalence: 'No data', color: '#f8d5cc' },
    ];
  }
}

export default CountryService;