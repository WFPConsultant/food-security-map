import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import Legend from './components/Legend';
import Optionsfield from './components/Optionsfield';
import './Map.css';
import geoJsonData from './data.json';


mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

let globalCountryData = [];

const Map = () => {
  const [active, setActive] = useState(null);
  const [tooltip, setTooltip] = useState({ display: false, content: '', x: 0, y: 0 });
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [legendData, setLegendData] = useState([]);
  const [options, setOptions] = useState([]);
  const hasFetchedData =useRef(false);
  const [loading, setLoading] = useState(true);

  // Function to fetch food security data
  const fetchFoodSecurityData = async () => {
    try {
      if (hasFetchedData.current) return; 
      hasFetchedData.current = true; 
      setLoading(true);

      const response = await fetch('https://api.hungermapdata.org/v1/foodsecurity/country');
      const data = await response.json();
      globalCountryData = data.body.countries;
      
      setOptionsData();
      paintMapWithPrevalence();
      prepareLegendData();

      setLoading(false); 
    } catch (error) {
      console.error('Error fetching food security data:', error);
      setLoading(false);
    }
  };

  // Function to set options based on the fetched API data
  const setOptionsData = () => {
    if (globalCountryData.length > 0) {
      const foodSecurityOption = {
        name: 'Food Security',
        description: 'Prevalence of food insecurity',
        property: 'iso3',
        stops: getColorStops(globalCountryData),
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

  const getColorStops = (countriesData, metric = 'fcs') => {
    return countriesData.map(country => {
      const iso3 = country.country.iso3;
      const prevalence = country.metrics[metric].prevalence;

      let color = '#6baed6'; // Default color

      if (prevalence > 0.5) color = '#08306b';
      else if (prevalence > 0.4) color = '#08519c';
      else if (prevalence > 0.3) color = '#2171b5';
      else if (prevalence > 0.2) color = '#4292c6';
      else if (prevalence > 0.1) color = '#6baed6';

      return [iso3, color];
    });
  };

  const prepareLegendData = () => {
    const thresholds = [
      { prevalence: '> 50% Very high', color: '#08306b' }, 
      { prevalence: '> 40% Moderately high', color: '#08519c' }, 
      { prevalence: '> 30% Moderately low', color: '#2171b5' },
      { prevalence: '> 20% Low', color: '#4292c6' }, 
      { prevalence: '> 10% Very low', color: '#6baed6' },
      { prevalence: 'No data', color: '#dceff7' },
    ];
    setLegendData(thresholds);
  };

  const paintMapWithPrevalence = () => {
    if (map && globalCountryData.length > 0) {
      const colorStops = getColorStops(globalCountryData);

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
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['country-fills'],
        });
      
        if (features.length) {
          map.getCanvas().style.cursor = 'pointer';
          const properties = features[0].properties;
      
          const countryData = globalCountryData.find(country => country.country.iso3 === properties.iso_a3);
      
          // Check if prevalence data exists
          const prevalence = countryData && countryData.metrics.fcs.prevalence !== undefined
            ? `${(countryData.metrics.fcs.prevalence * 100).toFixed(2)}%`
            : null;
      
          // Only show tooltip if prevalence data is available
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
            // Hide the tooltip if no prevalence data
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
      paintMapWithPrevalence();
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
        <div className="loading">Loading...</div>
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
