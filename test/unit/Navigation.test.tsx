import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import {describe, it, expect} from '@jest/globals'
import { render, screen } from '@testing-library/react';

import { Application } from '../../src/client/Application';
import { ExampleApi, CartApi } from '../../src/client/api';
import { initStore } from '../../src/client/store';
import { host } from '../const';

const generateStore = () => {
    const basename = '/hw/store';
    const api = new ExampleApi(basename);
    const cart = new CartApi();
    return initStore(api, cart);
}

afterEach(() => {
    localStorage.clear()
})

describe('Проверка страниц', () => {
    it('название магазина в шапке должно быть ссылкой на главную страницу', async () => {
        const store = generateStore()
        
        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );
        
        const { container } = render(application);
      
        const anchor = container.querySelector('.Application-Brand.navbar-brand')
        expect(anchor).toHaveProperty('href', host)
      });
    it('Рендер главной страницы', () => {
        const store = generateStore()
        
        const application = (
            <BrowserRouter>
                <Provider store={store}>
                    <Application />
                </Provider>
            </BrowserRouter>
        );
        
        render(application);
        
        const header = screen.getAllByRole('heading')
        const headers = header.map(el => el.textContent)
        expect(headers).toStrictEqual(['Stability', 'Comfort', 'Design']);
    });
    it('Рендер страницы /delivery', () => {
        const store = generateStore()
        
        const application = (
            <MemoryRouter initialEntries={['/delivery']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        
        render(application);
        
        const header = screen.getByRole('heading').textContent
        expect(header).toBe('Delivery');
    });
    it('Рендер страницы /contacts', () => {
        const store = generateStore()
        
        const application = (
            <MemoryRouter initialEntries={['/contacts']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        
        render(application);
        
        const header = screen.getByRole('heading').textContent
        expect(header).toBe('Contacts');
    });
    it('Рендер страницы /contacts', () => {
        const store = generateStore()
        
        const application = (
            <MemoryRouter initialEntries={['/contacts']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        
        render(application);
        
        const header = screen.getByRole('heading').textContent
        expect(header).toBe('Contacts');
    });
    it('Рендер страницы /catalog', () => {
        const store = generateStore()
        
        const application = (
            <MemoryRouter initialEntries={['/catalog']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        
        render(application);
        
        const header = screen.getByRole('heading').textContent
        expect(header).toBe('Catalog');
    });
    it('Рендер страницы /cart', () => {
        const store = generateStore()
        
        const application = (
            <MemoryRouter initialEntries={['/cart']}>
                <Provider store={store}>
                    <Application />
                </Provider>
            </MemoryRouter>
        );
        
        render(application);
        
        const header = screen.getByRole('heading').textContent
        expect(header).toBe('Shopping cart');
    });
});

it('В навигации находятся нужные элементы', () => {
    const store = generateStore()

    const application = (
        <BrowserRouter>
            <Provider store={store}>
                <Application />
            </Provider>
        </BrowserRouter>
    );

    render(application);
    const navigation = screen.getAllByRole('link')
    const buttons = navigation.map(el => el.textContent)

    expect(buttons).toStrictEqual([ 'Kogtetochka store', 'Catalog', 'Delivery', 'Contacts', 'Cart' ]);
});