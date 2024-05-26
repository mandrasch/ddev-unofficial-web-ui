export const projectTypeMappings = {
    php: { label: 'php (default)', docroot: '' },
    backdrop: { label: 'Backdrop', docroot: '' },
    cakephp: { label: 'CakePHP', docroot: 'webroot' },
    craftcms: { label: 'Craft CMS', docroot: 'web' },
    drupal: { label: 'Drupal', docroot: 'web' },
    laravel: { label: 'Laravel', docroot: 'public' },
    magento2: { label: 'Magento 2', docroot: 'pub' },
    shopware6: { label: 'Shopware 6', docroot: 'public' },
    silverstripe: { label: 'SilverStripe', docroot: 'public' },
    typo3: { label: 'TYPO3', docroot: 'public' },
    wordpress: { label: 'WordPress', docroot: '' }
};
export const projectTypes = Object.keys(projectTypeMappings);

export const phpVersions = ['8.3', '8.2', '8.1', '8.0', '7.4', '7.2', '7.1', '7.0', '5.6'];

export const databaseTypeMappings = {
    mysql: 'MySQL',
    postgres: 'PostgreSQL',
    mariadb: 'MariaDB',
    none: 'None'
};
export const databaseTypes = Object.keys(databaseTypeMappings);
export const databaseVersions = {
    mysql: ['8.0', '5.7', '5.5'],
    postgres: ['16', '15', '14', '13', '12', '11', '9'],
    mariadb: [
        '10.11',
        '10.10',
        '10.9',
        '10.8',
        '10.7',
        '10.6',
        '10.5',
        '10.4',
        '10.3',
        '10.2',
        '10.1',
        '10.0',
        '5.5'
    ]
};

export const webserverTypes = ['nginx-fpm', 'apache-fpm'];
export const nodejsVersions = ['20.3.1', '20.3', '20', '18', 'custom'];