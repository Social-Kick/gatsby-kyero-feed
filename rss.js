'use strict';
// Forked version from Dylang's Node-rss package, that also supports _cdata
var xml = require('xml');

function generateXML (data) {
    //set up the attributes for the RSS feed.
    var _attr = {
        'xmlns:xi':             'http://www.w3.org/2003/XInclude',
        'xmlns:xs':             'http://www.w3.org/2001/XMLSchema',
        'elementFormDefault':   'unqualified'
    };

    var props = [];

    data.properties.forEach(property => {
        const mappedPropertyImages = property.images.map((image, index) => ({
            image: [{ _attr: { id: index }}, { url: `https:${image.file.url}` }]
        }));
        
        const mappedPropertyDescription = property.desc.content !== '' && property.desc.content.length > 0 ? 
        property.desc.content
            .map(ci => ci.content
                .map(cic => cic.value)
                .join('&#13;')
            )
            .join('&#13;')
            .replace('\n/g', '&#13;') : 
        property.desc.content;
        
        const mappedProperty = [
            { id: property.id },
            { date: property.date },
            { ref: property.ref },
            { price: property.price },
            { currency: property.currency },
            { type: property.type },
            { town: property.town },
            { province: property.province },
            { country: property.country },
            { location: [{ latitude: property.latitude }, { longitude: property.longitude }] },
            { location_detail: property.location_detail },
            { beds: property.beds },
            { baths: property.baths },
            { pool: property.pool },
            { url: [{ nl: property.url }] },
            { price_freq: property.price_freq },
            { part_ownership: property.part_ownership },
            { leasehold: property.leasehold },
            { new_build: property.new_build },
            { surface_area: [{ built: '0' }, { plot: '0' }] },
            { energy_rating: [{ consumption: 'X' }, { emissions: 'X' }] },
            { catastral: '00000000000000000000' },
            { desc: [{ nl: mappedPropertyDescription }] },
            { images: mappedPropertyImages }
        ];
        props.push({ property: mappedProperty });
    });

    return {
        root: [
          { kyero: [{ feed_version: '3' }]},
          ...props
        ]
    }
}

function RSS (options, properties) {
    options = options || {};
    
    this.properties = properties || [];

    this.property = function (options) {
        options = options || {};
        var property = {
            id:               options.id || '',
            date:             options.date || '',
            ref:              options.ref || '',
            price:            options.price || '',
            currency:         options.currency || 'EUR',
            price_freq:       options.price_freq || 'sale',
            part_ownership:   options.part_ownership || '',
            leasehold:        options.leasehold || '',
            new_build:        options.new_build || '1',
            type:             options.type || '',
            town:             options.town || '',
            province:         options.province || '',
            country:          options.country || 'Spain',
            latitude:         options.latitude || '',
            longitude:        options.longitude || '',
            location_detail:  options.location_detail || '',
            beds:             options.beds || '',
            baths:            options.baths || '',
            pool:             options.pool || '',
            url:              options.url || '',
            images:           options.images || [],
            part_ownership:   '0',
            leasehold:        '0',
            desc:             options.desc || ''             
        };

        this.properties.push(property);
        return this;
    };

    this.xml = function(indent) {
        return '<?xml version="1.0" encoding="UTF-8"?>' +
            xml(generateXML(this), indent);
    };

}

module.exports = RSS;
