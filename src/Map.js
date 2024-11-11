import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Legend from './components/Legend';
import Optionsfield from './components/Optionsfield';
import './Map.css';
import geoJsonData from './data.json';
import CountryRepository from './repositories/CountryRepository';
import CountryService from './services/CountryService';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

let globalCountryData = [];

const Map = () => {
  const [active, setActive] = useState(null);
  const [tooltip, setTooltip] = useState({ display: false, content: '', x: 0, y: 0 });
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [legendData, setLegendData] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const countryRepository = new CountryRepository();
  const countryService = new CountryService(countryRepository);

  const fetchFoodSecurityData = async () => {
    try {
      setLoading(true);
      const countries = await countryService.getCountries();
      globalCountryData = countries;
      setOptionsData();
      paintMapWithPrevalence();
      prepareLegendData();
      setLoading(false);
    } catch (error) {
      console.error('Error fetching food security data:', error);
      setLoading(false);
    }
  };

  const setOptionsData = () => {
    if (globalCountryData.length > 0) {
      const foodSecurityOption = {
        name: 'Food Security',
        description: 'Prevalence of food insecurity',
        property: 'iso3',
        stops: countryService.getColorStops(globalCountryData),
      };
      const optionExists = options.some(option => option.name === foodSecurityOption.name);
      if (!optionExists) {
        setOptions([foodSecurityOption]);
        if (!active) {
          setActive(foodSecurityOption);
        }
      }
    }
  };

  const prepareLegendData = () => {
    const thresholds = countryService.prepareLegendData();
    setLegendData(thresholds);
  };

  const paintMapWithPrevalence = () => {
    if (map && globalCountryData.length > 0) {
      const colorStops = countryService.getColorStops(globalCountryData);
      map.setPaintProperty('country-fills', 'fill-color', {
        property: 'iso_a3',
        type: 'categorical',
        stops: colorStops,
        default: '#dceff7',
      });
    }
  };

  const changeState = (i) => {
    setActive(options[i]);
    if (map && options[i]) {
      paintMapWithPrevalence();
    }
  };

  useEffect(() => {
    fetchFoodSecurityData();
  }, []);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [5, 34],
      zoom: 1.5,
    });

    map.on('load', () => {
      map.addSource('countries', {
        type: 'geojson',
        data: geoJsonData,
      });

      map.setLayoutProperty('country-label', 'text-field', [
        'format',
        ['get', 'name_en'],
        { 'font-scale': 1.2 },
        '\n',
        {},
        ['get', 'name'],
        {
          'font-scale': 0.8,
          'text-font': [
            'literal',
            ['DIN Offc Pro Italic', 'Arial Unicode MS Regular'],
          ],
        },
      ]);

      map.addLayer(
        {
          id: 'country-fills',
          type: 'fill',
          source: 'countries',
        },
        'country-label'
      );

      map.addLayer({
        id: 'country-borders',
        type: 'line',
        source: 'countries',
        layout: {},
        paint: {
          'line-color': '#627BC1',
          'line-width': 1,
        },
      });

      map.addLayer({
        id: 'country-fills-hover',
        type: 'fill',
        source: 'countries',
        layout: {},
        paint: {
          'fill-color': '#000000',
          'fill-opacity': 0.3,
        },
        filter: ['==', 'name', ''],
      });

      map.on('mousemove', (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: ['country-fills'] });
        if (features.length) {
          map.getCanvas().style.cursor = 'pointer';
          const properties = features[0].properties;
          const countryData = globalCountryData.find(country => country.iso3 === properties.iso_a3);
          const prevalence = countryData && countryData.metrics.fcs.prevalence !== undefined
            ? `${(countryData.metrics.fcs.prevalence * 100).toFixed(2)}%`
            : null;
          if (prevalence) {
            const people = countryData ? `${(countryData.metrics.fcs.people / 1000000).toFixed(2)} Million` : 'No data available';
            setTooltip({
              display: true,
              content: `Country: ${properties.name} || Prevalence: ${prevalence} || People affected: ${people}`,
              x: e.originalEvent.clientX,
              y: e.originalEvent.clientY,
              html: true,
            });
            map.setFilter('country-fills-hover', [
              '==',
              'name',
              properties.name,
            ]);
          } else {
            map.setFilter('country-fills-hover', ['==', 'name', '']);
            map.getCanvas().style.cursor = '';
            setTooltip({ ...tooltip, display: false });
          }
        } else {
          map.setFilter('country-fills-hover', ['==', 'name', '']);
          map.getCanvas().style.cursor = '';
          setTooltip({ ...tooltip, display: false });
        }
      });

      map.on('mouseout', () => {
        map.getCanvas().style.cursor = 'auto';
        map.setFilter('country-fills-hover', ['==', 'name', '']);
        setTooltip({ ...tooltip, display: false });
      });

      setMap(map);
    });

    return () => map.remove();
  }, []);

  useEffect(() => {
    if (map && active) {
      paintMapWithPrevalence();
    }
  }, [active, map]);

  return (
    <div>
      {loading && (
      <div className="loading-container">
        <div className="loading"></div>
      </div>
      )}
      <div ref={mapContainerRef} className="map-container" />
      {active && active.name && (
        <Legend active={active} legendData={legendData} />
      )}
      <Optionsfield
        options={options}
        property={active ? active.property : null}
        changeState={changeState}
      />
      {tooltip.display && (
        <div
          className="tooltip"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default Map;
