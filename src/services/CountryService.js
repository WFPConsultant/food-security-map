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
    
      if (prevalence > 0.5) return '#08306b';
      else if (prevalence > 0.4) return '#08519c';
      else if (prevalence > 0.3) return '#2171b5';
      else if (prevalence > 0.2) return '#4292c6';
      else if (prevalence > 0.1) return '#6baed6';

      return '#6baed6'; // Default color
  }

  prepareLegendData() {
    return [
      { prevalence: '> 50% Very high', color: '#08306b' }, 
      { prevalence: '> 40% Moderately high', color: '#08519c' }, 
      { prevalence: '> 30% Moderately low', color: '#2171b5' },
      { prevalence: '> 20% Low', color: '#4292c6' }, 
      { prevalence: '> 10% Very low', color: '#6baed6' },
      { prevalence: 'No data', color: '#dceff7' },
    ];
  }
}

export default CountryService;
