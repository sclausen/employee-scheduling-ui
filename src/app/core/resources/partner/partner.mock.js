/**
 * @author    Martin Micunda {@link http://martinmicunda.com}
 * @copyright Copyright (c) 2015, Martin Micunda
 * @license   GPL-3.0
 */
'use strict';

import partner1 from './fixtures/partner_1.json!json';
import partners from './fixtures/partners.json!json';
import {Run, Inject} from '../../../ng-decorators'; // jshint unused: false

class PositionResourceMock {
    //start-non-standard
    @Run()
    @Inject('$httpBackend', 'localStorageService', '$window')
    //end-non-standard
    static runFactory($httpBackend, localStorageService, $window){
        partners.forEach(function (partner) {
            localStorageService.set(`partner_${partner.id}`, partner);
        });

        $httpBackend.whenGET(/\/partners\/[a-z]*/)
            .respond( (method, url) => {
                console.log('GET',url);
                const id = url.match(/\/partners\/(\d+)/)[1];
                const partnerLocal = localStorageService.get(`partner_${id}`);

                if(id === '404') {
                    return [404];
                } else if(id === '500') {
                    return [500];
                }

                return [200, partnerLocal ? partnerLocal : partner1];
            });

        $httpBackend.whenGET(/\/partners/)
            .respond( (method, url) => {
                console.log('GET',url);
                const partnersLocal = localStorageService.findLocalStorageItems(/\.partner_(\d+)/);

                return [200, partnersLocal.length > 0 ? partnersLocal : partners];
            });

        $httpBackend.whenPOST(/\/partners/)
            .respond( (method, url, data) => {
                console.log('POST',url);
                data = JSON.parse(data);

                if(data.name === '500') {
                    return [500];
                } else if(data.name === '409') {
                    return [409];
                }

                data.id = Math.floor(Date.now() / 1000);
                localStorageService.set(`partner_${data.id}`, data);

                return [201, {id: data.id}];
            });

        $httpBackend.whenPUT(/\/partners/)
            .respond( (method, url, data) => {
                console.log('PUT',url);
                data = JSON.parse(data);

                if(data.name === '404') {
                    return [404];
                } else if(data.name === '409') {
                    return [409];
                } else if(data.name === '500') {
                    return [500];
                }

                localStorageService.set(`partner_${data.id}`, data);
                return [200, data];
            });

        $httpBackend.whenDELETE(/\/partners/)
            .respond( (method, url, data) => {
                console.log('DELETE',url);
                data = JSON.parse(data);

                if(data.name === '404') {
                    return [404];
                } else if(data.name === '500') {
                    return [500];
                }

                const id = url.match(/\/partners\/(\d+)/)[1];
                localStorageService.remove(`partner_${id}`);

                return [204];
            });
    }
}
