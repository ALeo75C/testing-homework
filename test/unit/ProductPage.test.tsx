import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import events from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { CartApi, ExampleApi } from '../../src/client/api';
import { initStore } from '../../src/client/store';
import { MemoryRouter } from 'react-router-dom';
import { ProductDetails } from '../../src/client/components/ProductDetails';
import { Catalog } from '../../src/client/pages/Catalog';
import { host } from '../const';

afterEach(() => {
    localStorage.clear()
})

describe('Страница продукта', () => {
    it('На странице подукта отоброжается вся информаця', () => {
        let product = {
            id: 0,
            name: 'Test',
            description: 'test test test testtesttest testtest test',
            price: 200,
            color: 'color',
            material: 'material'
        }
        const api = new ExampleApi('/catalog/1');
        const store = initStore(api, new CartApi());
        
        const page = (
            <Provider store={store}>
                <ProductDetails product={product} />
            </Provider>
        )
        const {container} = render(page); 
        
        const title = screen.getByRole('heading').textContent
        const deck = container.getElementsByClassName('ProductDetails-Description')[0].textContent
        const price = container.getElementsByClassName('ProductDetails-Price')[0].textContent
        const color = container.getElementsByClassName('ProductDetails-Color')[0].textContent
        const material = container.getElementsByClassName('ProductDetails-Material')[0].textContent
        
        expect(title).toBe('Test');
        expect(deck).toBe('test test test testtesttest testtest test');
        expect(price).toBe('$200');
        expect(color).toBe('color');
        expect(material).toBe('material');
    });
    it('При клике на кнопку "Добавить в корзину" появляется надпись, что товар добавлен к корзину', async() => {
        let product = {
            id: 0,
            name: 'Test',
            description: 'test test test testtesttest testtest test',
            price: 200,
            color: 'color',
            material: 'material'
        }
        const api = new ExampleApi('/catalog/1');
        const store = initStore(api, new CartApi());
        
        const page = (
            <Provider store={store}>
                <ProductDetails product={product} />
            </Provider>
        )
        render(page); 
        
        const button = screen.getByRole('button')
        await events.click(button)
        
        const addMeaasge = screen.getByText(/Item in cart/i)
        expect(addMeaasge).toBeTruthy();
    });
    it('При повторном добавлении в корзину кол-во товаров увеличивается', async() => {
        let product = {
            id: 0,
            name: 'Test',
            description: 'test test test testtesttest testtest test',
            price: 200,
            color: 'color',
            material: 'material'
        }
        const api = new ExampleApi('/catalog/1');
        const store = initStore(api, new CartApi());
        
        const page = (
            <Provider store={store}>
                <ProductDetails product={product} />
            </Provider>
        )
        render(page); 
        
        const currentCount = Number(store.getState().cart[0] ? store.getState().cart[0].count : 0)
        const button = screen.getByRole('button')
        await events.click(button)
        
        expect(store.getState().cart[0] ? store.getState().cart[0].count : 0).toBe(currentCount + 1);
    });
    it('Товары не пропадают из корзины при перезагрузке', async () => {
        Object.defineProperty(window, 'location', {
            value: { reload: jest.fn() }
          });
          let product = {
              id: 700,
              name: 'Test',
              description: 'test test test testtesttest testtest test',
              price: 200,
              color: 'color',
              material: 'material'
            }
            const api = new ExampleApi('/catalog/700');
            const store = initStore(api, new CartApi());
            
            const page = (
                <MemoryRouter initialEntries={['/catalog/700']}>
                <Provider store={store}>
                    <ProductDetails product={product} />
                </Provider>
            </MemoryRouter>
        )
        render(page); 
        
        const button = screen.getByRole('button')
        await events.click(button)
        
        window.location.reload()
        
        const addMeaasge = screen.getByText(/Item in cart/i)
        expect(addMeaasge).toBeTruthy();
    });
    it('Страница каталога отображает карточки товара', async() => {
        const products = [
            {
                id: 0,
                name: 'Test',
                price: 200,
            },
            {
                id: 1,
                name: 'Test2',
                price: 100,
            }
        ]
        const api = new ExampleApi('/');
        const mockDataFn = jest.fn().mockResolvedValue({data: products})
        api.getProducts = mockDataFn
    
        const page = (
            <MemoryRouter initialEntries={['/catalog']}>
                <Provider store={initStore(api, new CartApi())}>
                    <Catalog />
                </Provider>
            </MemoryRouter>
        )
        const {getAllByTestId} = render(page); 

        await waitFor(() => {
            expect(mockDataFn).toHaveBeenCalledTimes(1)
            const [item1, item2] = [getAllByTestId('0')[1].lastChild, getAllByTestId('1')[1].lastChild]
            
            const title1 = item1?.childNodes[0].textContent
            const price1 = item1?.childNodes[1].textContent
            const link1 = item1?.childNodes[2]
            const title2 = item2?.childNodes[0].textContent
            const price2 = item2?.childNodes[1].textContent
            const link2 = item2?.childNodes[2]

            expect(title1).toBe('Test');
            expect(price1).toBe('$200');
            expect(link1).toHaveProperty('href', host + 'catalog/0');
            expect(title2).toBe('Test2');
            expect(price2).toBe('$100');
            expect(link2).toHaveProperty('href', host + 'catalog/1');
        })

    });
});