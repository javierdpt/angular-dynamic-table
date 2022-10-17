import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { delay, map, Observable } from 'rxjs';

export interface PeriodicElement {
  name: string;
  position: number;
  weight: number;
  symbol: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  example: 'static' | 'users' | 'products' = 'static';
  staticData = [
    {
      id: 1,
      firstName: 'Gary',
      lastName: 'Ortiz',
      email: 'gortiz0@mapy.cz',
      country: 'Indonesia',
      modified: '2015-05-16',
    },
    {
      id: 2,
      firstName: 'Albert',
      lastName: 'Williamson',
      email: 'awilliamson1@narod.ru',
      country: 'China',
      modified: '2015-03-11',
      vip: true,
    },
    {
      id: 3,
      firstName: 'Mildred',
      lastName: 'Fuller',
      email: 'mfuller2@npr.org',
      country: 'Peru',
      modified: '2015-02-15',
      vip: true,
    },
    {
      id: 4,
      firstName: 'Russell',
      lastName: 'Robinson',
      email: 'rrobinson3@google.pl',
      country: 'Belarus',
      modified: '2014-10-31',
      vip: false,
    },
    {
      id: 5,
      firstName: 'Laura',
      lastName: 'Harper',
      email: 'lharper4@boston.com',
      country: 'Philippines',
      modified: '2015-01-14',
      vip: false,
    },
    {
      id: 6,
      firstName: 'Larry',
      lastName: 'Sanders',
      email: 'lsanders5@cornell.edu',
      country: 'China',
      modified: '2015-01-11',
      vip: false,
    },
    {
      id: 7,
      firstName: 'Michael',
      lastName: 'Rice',
      email: 'mrice6@geocities.jp',
      country: 'Philippines',
      modified: '2014-12-06',
      vip: true,
    },
    {
      id: 8,
      firstName: 'Sara',
      lastName: 'Harris',
      email: 'sharris7@deliciousdays.com',
      country: 'Indonesia',
      modified: '2014-11-05',
      vip: true,
    },
    {
      id: 9,
      firstName: 'Phyllis',
      lastName: 'Webb',
      email: 'pwebb8@reddit.com',
      country: 'China',
      modified: '2015-04-02',
      vip: true,
    },
    {
      id: 10,
      firstName: 'Roger',
      lastName: 'Alvarez',
      email: 'ralvarez9@nsw.gov.au',
      country: 'Finland',
      modified: '2015-03-21',
      vip: true,
    },
    {
      id: 11,
      firstName: 'Maria',
      lastName: 'Carpenter',
      email: 'mcarpentera@so-net.ne.jp',
      country: 'Sweden',
      modified: '2015-08-18',
      vip: true,
    },
    {
      id: 12,
      firstName: 'Lori',
      lastName: 'Edwards',
      email: 'ledwardsb@storify.com',
      country: 'Russia',
      modified: '2015-02-05',
      vip: true,
    },
    {
      id: 13,
      firstName: 'Phillip',
      lastName: 'Mitchell',
      email: 'pmitchellc@ebay.co.uk',
      country: 'Russia',
      modified: '2015-03-28',
      vip: false,
    },
    {
      id: 14,
      firstName: 'Craig',
      lastName: 'Lopez',
      email: 'clopezd@hexun.com',
      country: 'Indonesia',
      modified: '2015-01-20',
      vip: true,
    },
    {
      id: 15,
      firstName: 'Marie',
      lastName: 'George',
      email: 'mgeorgee@squarespace.com',
      country: 'Mauritius',
      modified: '2014-10-26',
      vip: true,
    },
    {
      id: 16,
      firstName: 'Jean',
      lastName: 'Duncan',
      email: 'jduncanf@pbs.org',
      country: 'Norway',
      modified: '2014-11-19',
      vip: true,
    },
    {
      id: 17,
      firstName: 'Kimberly',
      lastName: 'Butler',
      email: 'kbutlerg@wix.com',
      country: 'Sweden',
      modified: '2014-12-29',
      vip: false,
    },
    {
      id: 18,
      firstName: 'Heather',
      lastName: 'Ramirez',
      email: 'hramirezh@instagram.com',
      country: 'Indonesia',
      modified: '2015-07-13',
      vip: false,
    },
    {
      id: 19,
      firstName: 'Jason',
      lastName: 'Sanders',
      email: 'jsandersi@earthlink.net',
      country: 'Canada',
      modified: '2015-02-25',
      vip: false,
    },
    {
      id: 20,
      firstName: 'Juan',
      lastName: 'Evans',
      email: 'jevansj@google.de',
      country: 'Philippines',
      modified: '2015-07-09',
      vip: true,
    },
    {
      id: 21,
      firstName: 'Billy',
      lastName: 'Tucker',
      email: 'btuckerk@businessweek.com',
      country: 'Indonesia',
      modified: '2015-02-08',
      vip: false,
    },
    {
      id: 22,
      firstName: 'Fred',
      lastName: 'Duncan',
      email: 'fduncanl@smugmug.com',
      country: 'Brazil',
      modified: '2015-03-05',
      vip: true,
    },
    {
      id: 23,
      firstName: 'Daniel',
      lastName: 'Peterson',
      email: 'dpetersonm@deliciousdays.com',
      country: 'Nigeria',
      modified: '2014-10-08',
      vip: false,
    },
    {
      id: 24,
      firstName: 'Kelly',
      lastName: 'Gilbert',
      email: 'kgilbertn@guardian.co.uk',
      country: 'Mexico',
      modified: '2014-12-29',
      vip: false,
    },
    {
      id: 25,
      firstName: 'Aaron',
      lastName: 'Hart',
      email: 'aharto@oakley.com',
      country: 'Russia',
      modified: '2015-08-01',
      vip: false,
    },
    {
      id: 26,
      firstName: 'Phillip',
      lastName: 'Cook',
      email: 'pcookp@i2i.jp',
      country: 'China',
      modified: '2014-09-12',
      vip: true,
    },
    {
      id: 27,
      firstName: 'Sara',
      lastName: 'Perry',
      email: 'sperryq@examiner.com',
      country: 'Czech Republic',
      modified: '2015-02-15',
      vip: false,
    },
    {
      id: 28,
      firstName: 'Karen',
      lastName: 'Fields',
      email: 'kfieldsr@home.pl',
      country: 'Iran',
      modified: '2015-04-18',
      vip: false,
    },
    {
      id: 29,
      firstName: 'Nancy',
      lastName: 'Schmidt',
      email: 'nschmidts@sogou.com',
      country: 'Venezuela',
      modified: '2014-12-09',
      vip: true,
    },
    {
      id: 30,
      firstName: 'Theresa',
      lastName: 'Chavez',
      email: 'tchavezt@smh.com.au',
      country: 'Czech Republic',
      modified: '2015-01-07',
      vip: true,
    },
    {
      id: 31,
      firstName: 'Howard',
      lastName: 'Crawford',
      email: 'hcrawfordu@list-manage.com',
      country: 'Brazil',
      modified: '2015-03-17',
      vip: false,
    },
    {
      id: 32,
      firstName: 'Catherine',
      lastName: 'Johnson',
      email: 'cjohnsonv@bandcamp.com',
      country: 'Canada',
      modified: '2014-09-05',
      vip: true,
    },
    {
      id: 33,
      firstName: 'Nicholas',
      lastName: 'Morales',
      email: 'nmoralesw@deviantart.com',
      country: 'Canada',
      modified: '2015-04-01',
      vip: false,
    },
    {
      id: 34,
      firstName: 'Chris',
      lastName: 'Morales',
      email: 'cmoralesx@ow.ly',
      country: 'China',
      modified: '2015-03-05',
      vip: true,
    },
    {
      id: 35,
      firstName: 'Mildred',
      lastName: 'Frazier',
      email: 'mfraziery@theglobeandmail.com',
      country: 'Pakistan',
      modified: '2014-11-12',
      vip: true,
    },
    {
      id: 36,
      firstName: 'Mark',
      lastName: 'Harper',
      email: 'mharperz@weebly.com',
      country: 'Botswana',
      modified: '2015-05-31',
      vip: false,
    },
    {
      id: 37,
      firstName: 'Michael',
      lastName: 'Ryan',
      email: 'mryan10@si.edu',
      country: 'South Africa',
      modified: '2014-12-14',
      vip: true,
    },
    {
      id: 38,
      firstName: 'Matthew',
      lastName: 'Ruiz',
      email: 'mruiz11@clickbank.net',
      country: 'Oman',
      modified: '2015-06-19',
      vip: true,
    },
    {
      id: 39,
      firstName: 'Jose',
      lastName: 'Morales',
      email: 'jmorales12@dedecms.com',
      country: 'Palestinian Territory',
      modified: '2014-09-29',
      vip: true,
    },
    {
      id: 40,
      firstName: 'Scott',
      lastName: 'Simpson',
      email: 'ssimpson13@weather.com',
      country: 'Ukraine',
      modified: '2014-10-18',
      vip: true,
    },
    {
      id: 41,
      firstName: 'Pamela',
      lastName: 'Welch',
      email: 'pwelch14@phpbb.com',
      country: 'Brazil',
      modified: '2014-10-26',
      vip: false,
    },
    {
      id: 42,
      firstName: 'Ruth',
      lastName: 'Mcdonald',
      email: 'rmcdonald15@discovery.com',
      country: 'Indonesia',
      modified: '2015-04-18',
      vip: false,
    },
    {
      id: 43,
      firstName: 'Kevin',
      lastName: 'Fields',
      email: 'kfields16@businesswire.com',
      country: 'Indonesia',
      modified: '2014-09-10',
      vip: true,
    },
    {
      id: 44,
      firstName: 'Justin',
      lastName: 'Kim',
      email: 'jkim17@xinhuanet.com',
      country: 'Finland',
      modified: '2015-01-24',
      vip: true,
    },
    {
      id: 45,
      firstName: 'Wanda',
      lastName: 'Jones',
      email: 'wjones18@jigsy.com',
      country: 'Philippines',
      modified: '2014-08-23',
      vip: true,
    },
    {
      id: 46,
      firstName: 'Jose',
      lastName: 'Carter',
      email: 'jcarter19@mlb.com',
      country: 'China',
      modified: '2015-02-06',
      vip: false,
    },
    {
      id: 47,
      firstName: 'Joe',
      lastName: 'Gonzales',
      email: 'jgonzales1a@google.ru',
      country: 'China',
      modified: '2014-12-12',
      vip: true,
    },
    {
      id: 48,
      firstName: 'Martin',
      lastName: 'Thompson',
      email: 'mthompson1b@acquirethisname.com',
      country: 'China',
      modified: '2015-06-16',
      vip: true,
    },
    {
      id: 49,
      firstName: 'Phillip',
      lastName: 'Hayes',
      email: 'phayes1c@alexa.com',
      country: 'Dominican Republic',
      modified: '2015-01-03',
      vip: true,
    },
    {
      id: 50,
      firstName: 'Angela',
      lastName: 'Shaw',
      email: 'ashaw1d@bigcartel.com',
      country: 'Malaysia',
      modified: '2014-10-20',
      vip: true,
    },
    {
      id: 51,
      firstName: 'Jimmy',
      lastName: 'Garza',
      email: 'jgarza1e@stumbleupon.com',
      country: 'China',
      modified: '2015-01-18',
      vip: true,
    },
    {
      id: 52,
      firstName: 'Doris',
      lastName: 'Cook',
      email: 'dcook1f@cocolog-nifty.com',
      country: 'Canada',
      modified: '2015-04-07',
      vip: false,
    },
    {
      id: 53,
      firstName: 'Nancy',
      lastName: 'Thompson',
      email: 'nthompson1g@seesaa.net',
      country: 'Russia',
      modified: '2015-01-04',
      vip: true,
    },
    {
      id: 54,
      firstName: 'Sarah',
      lastName: 'Stanley',
      email: 'sstanley1h@google.ru',
      country: 'Poland',
      modified: '2015-06-13',
      vip: false,
    },
    {
      id: 55,
      firstName: 'Douglas',
      lastName: 'Gardner',
      email: 'dgardner1i@jugem.jp',
      country: 'China',
      modified: '2014-10-22',
      vip: true,
    },
    {
      id: 56,
      firstName: 'Mark',
      lastName: 'Thomas',
      email: 'mthomas1j@deviantart.com',
      country: 'Ireland',
      modified: '2015-05-27',
      vip: false,
    },
    {
      id: 57,
      firstName: 'Judith',
      lastName: 'Jenkins',
      email: 'jjenkins1k@nps.gov',
      country: 'China',
      modified: '2014-09-30',
      vip: true,
    },
    {
      id: 58,
      firstName: 'Henry',
      lastName: 'Ross',
      email: 'hross1l@chicagotribune.com',
      country: 'Botswana',
      modified: '2015-06-02',
      vip: false,
    },
    {
      id: 59,
      firstName: 'Kimberly',
      lastName: 'Gomez',
      email: 'kgomez1m@blog.com',
      country: 'Mexico',
      modified: '2015-01-05',
      vip: false,
    },
    {
      id: 60,
      firstName: 'Pamela',
      lastName: 'Nelson',
      email: 'pnelson1n@marketwatch.com',
      country: 'Mexico',
      modified: '2014-11-06',
      vip: false,
    },
    {
      id: 61,
      firstName: 'Elizabeth',
      lastName: 'Sanchez',
      email: 'esanchez1o@artisteer.com',
      country: 'Portugal',
      modified: '2015-03-16',
      vip: true,
    },
    {
      id: 62,
      firstName: 'Charles',
      lastName: 'Fuller',
      email: 'cfuller1p@google.com.hk',
      country: 'Philippines',
      modified: '2015-02-16',
      vip: false,
    },
    {
      id: 63,
      firstName: 'Andrew',
      lastName: 'Stewart',
      email: 'astewart1q@nature.com',
      country: 'Portugal',
      modified: '2014-11-02',
      vip: false,
    },
    {
      id: 64,
      firstName: 'Maria',
      lastName: 'Kennedy',
      email: 'mkennedy1r@economist.com',
      country: 'China',
      modified: '2015-08-03',
      vip: true,
    },
    {
      id: 65,
      firstName: 'Clarence',
      lastName: 'Ferguson',
      email: 'cferguson1s@gnu.org',
      country: 'Colombia',
      modified: '2014-10-08',
      vip: true,
    },
    {
      id: 66,
      firstName: 'Annie',
      lastName: 'Campbell',
      email: 'acampbell1t@alexa.com',
      country: 'Tunisia',
      modified: '2015-01-05',
      vip: true,
    },
    {
      id: 67,
      firstName: 'Jeremy',
      lastName: 'Wilson',
      email: 'jwilson1u@ca.gov',
      country: 'Indonesia',
      modified: '2014-11-01',
      vip: false,
    },
    {
      id: 68,
      firstName: 'Jeremy',
      lastName: 'Ward',
      email: 'jward1v@dmoz.org',
      country: 'Indonesia',
      modified: '2014-11-16',
      vip: true,
    },
    {
      id: 69,
      firstName: 'Peter',
      lastName: 'Brown',
      email: 'pbrown1w@liveinternet.ru',
      country: 'Sweden',
      modified: '2015-01-08',
      vip: true,
    },
    {
      id: 70,
      firstName: 'Laura',
      lastName: 'Stewart',
      email: 'lstewart1x@google.it',
      country: 'Russia',
      modified: '2015-04-23',
      vip: true,
    },
    {
      id: 71,
      firstName: 'Christina',
      lastName: 'Montgomery',
      email: 'cmontgomery1y@free.fr',
      country: 'Zimbabwe',
      modified: '2015-06-02',
      vip: true,
    },
    {
      id: 72,
      firstName: 'Amy',
      lastName: 'Bishop',
      email: 'abishop1z@exblog.jp',
      country: 'China',
      modified: '2014-12-13',
      vip: true,
    },
    {
      id: 73,
      firstName: 'Jeffrey',
      lastName: 'Pierce',
      email: 'jpierce20@usnews.com',
      country: 'France',
      modified: '2014-11-05',
      vip: false,
    },
    {
      id: 74,
      firstName: 'Virginia',
      lastName: 'Welch',
      email: 'vwelch21@wunderground.com',
      country: 'Philippines',
      modified: '2014-10-24',
      vip: false,
    },
    {
      id: 75,
      firstName: 'Beverly',
      lastName: 'Lane',
      email: 'blane22@amazon.com',
      country: 'Poland',
      modified: '2014-09-01',
      vip: false,
    },
    {
      id: 76,
      firstName: 'Norma',
      lastName: 'Howard',
      email: 'nhoward23@imgur.com',
      country: 'Venezuela',
      modified: '2015-07-24',
      vip: false,
    },
    {
      id: 77,
      firstName: 'Margaret',
      lastName: 'Kelley',
      email: 'mkelley24@imageshack.us',
      country: 'China',
      modified: '2015-02-22',
      vip: false,
    },
    {
      id: 78,
      firstName: 'Brenda',
      lastName: 'Miller',
      email: 'bmiller25@technorati.com',
      country: 'Canada',
      modified: '2015-04-15',
      vip: false,
    },
    {
      id: 79,
      firstName: 'Catherine',
      lastName: 'White',
      email: 'cwhite26@google.ru',
      country: 'France',
      modified: '2015-05-01',
      vip: false,
    },
    {
      id: 80,
      firstName: 'Mary',
      lastName: 'Berry',
      email: 'mberry27@freewebs.com',
      country: 'Russia',
      modified: '2014-11-27',
      vip: true,
    },
    {
      id: 81,
      firstName: 'Sarah',
      lastName: 'Young',
      email: 'syoung28@digg.com',
      country: 'China',
      modified: '2015-05-12',
      vip: true,
    },
    {
      id: 82,
      firstName: 'Craig',
      lastName: 'Moreno',
      email: 'cmoreno29@paypal.com',
      country: 'Greece',
      modified: '2015-05-12',
      vip: true,
    },
    {
      id: 83,
      firstName: 'Louise',
      lastName: 'Fisher',
      email: 'lfisher2a@github.com',
      country: 'Indonesia',
      modified: '2014-09-10',
      vip: true,
    },
    {
      id: 84,
      firstName: 'Carol',
      lastName: 'Ray',
      email: 'cray2b@wp.com',
      country: 'Saudi Arabia',
      modified: '2015-04-10',
      vip: true,
    },
    {
      id: 85,
      firstName: 'Sean',
      lastName: 'Bishop',
      email: 'sbishop2c@geocities.com',
      country: 'France',
      modified: '2014-10-22',
      vip: true,
    },
    {
      id: 86,
      firstName: 'Joseph',
      lastName: 'Weaver',
      email: 'jweaver2d@nature.com',
      country: 'Portugal',
      modified: '2015-02-17',
      vip: true,
    },
    {
      id: 87,
      firstName: 'Louise',
      lastName: 'Ramos',
      email: 'lramos2e@mit.edu',
      country: 'Macedonia',
      modified: '2015-08-14',
      vip: false,
    },
    {
      id: 88,
      firstName: 'Brian',
      lastName: 'Carpenter',
      email: 'bcarpenter2f@eepurl.com',
      country: 'Indonesia',
      modified: '2015-02-23',
      vip: true,
    },
  ];

  constructor(private _httpClient: HttpClient) {}

  getProducts(): any {
    return this._httpClient.get('https://dummyjson.com/products').pipe(
      map((r: any) => r.products),
      delay(1000)
    );
  }

  getUsers(): any {
    return this._httpClient.get('https://dummyjson.com/users').pipe(
      map((r: any) => r.users),
      delay(1000)
    );
  }

  transformStatic = (key: string, value: any): string => {
    switch (key) {
      case 'vip':
        return `<strong class="${value}">${value ? 'Yes' : 'No'}</strong>`;
      default:
        return value;
    }
  };

  transformImage =
    (propName: string, extraTransform?: (key: any, value: any) => string) =>
    (key: any, value: any): string => {
      switch (key) {
        case propName:
          return `<img src="${value}" class="w-100px"/>`;
        default:
          return extraTransform ? extraTransform(key, value) : value;
      }
    };

  transformProductImages = (key: any, value: any): string => {
    switch (key) {
      case 'images':
        const images = value.map(
          (src: string) => `<img src="${src}" class="w-50px"/>`
        );
        return `<div class="d-flex">${images.join('')}</div>`;
      default:
        return value;
    }
  };
}
