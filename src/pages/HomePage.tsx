import React, { useState, useEffect } from 'react';
import ItemList from '../components/ItemList';
import FavoritesList from '../components/FavoritesList';
import Notification from '../components/Notification';
import { getItem, setItem, getCategory, setCategory } from '../utils/storage';
import { ItemProps } from 'components/Item';

const HomePage: React.FC = () => {
    const initialItems = [
        { name: 'Apple', quantity: 5, price: 1.5, category: 'Fruits' },
        { name: 'Banana', quantity: 3, price: 0.5, category: 'Fruits' },
    ];

    const initialCategories = getCategory('categories') || ['Fruits', 'Vegetables', 'Cleaning Products'];

    const [items, setItems] = useState<ItemProps[]>(initialItems);
    const [favoriteItems, setFavoriteItems] = useState<ItemProps[]>([]);
    const [categories, setCategories] = useState<string[]>(initialCategories);
    const [notification, setNotification] = useState<string | null>(null);
    const [newItem, setNewItem] = useState<ItemProps>({ name: '', quantity: 0, price: 0, category: '' });
    const [budget, setBudget] = useState<number>(0);
    const [cartItems, setCartItems] = useState<ItemProps[]>([]);
    const [isChangeMade, setIsChangesMade] = useState<boolean>(false);
    const [newCategory, setNewCategory] = useState<string>('');

    useEffect(() => {
        updateAppStateFromLocalStorage();
        setIsChangesMade(false);
    }, []);

    useEffect(() => {
        if (budget !== parseFloat(getItem('budget'))) {
            setIsChangesMade(true);
        }
    }, [budget]);

    const addItem = (item: ItemProps): void => {
        const newItemWithCategory = { ...item, category: item.category || '' };
        setItems([...items, newItemWithCategory]);
        saveToLocalStorage();
    };

    const isValidItem = (item: ItemProps): boolean => {
        return item.name.trim() !== '' && item.quantity > 0 && item.price > 0;
    };

    const resetNewItem = (): void => {
        setNewItem({ name: '', quantity: 0, price: 0, category: '' });
    };

    const notify = (message: string): void => {
        setNotification(message);
    };

    const handleAddFavorite = (item: ItemProps): void => {
        if (!favoriteItems.some(favItem => favItem.name === item.name)) {
            setFavoriteItems([...favoriteItems, item]);
            notify('Item added to favorites.');
            setIsChangesMade(true);
        } else {
            notify('Item is already in favorites.');
        }
    };

    const handleRemoveFavorite = (index: number): void => {
        const updatedFavorites = favoriteItems.filter((_, i) => i !== index);
        setFavoriteItems(updatedFavorites);
        notify('Item removed from favorites.');
        setIsChangesMade(true);
    };

    const handleAddItemtoCategory = (): void => {
        if (isValidItem(newItem)) {
            const existingItemIndex = items.findIndex(item => item.name === newItem.name);

            if (existingItemIndex !== -1) {
                const updatedItems = [...items];
                updatedItems[existingItemIndex].quantity += newItem.quantity;
                setItems(updatedItems);
            } else {
                const newItemWithCategory = { ...newItem, category: newItem.category || '' };

                if (newItemWithCategory.category && !categories.includes(newItemWithCategory.category)) {
                    setCategories([...categories, newItemWithCategory.category]);
                }

                addItem(newItemWithCategory);
            }

            notify('Item added.');
            setIsChangesMade(true);
            resetNewItem();
        } else {
            notify('Please fill in all fields and enter valid values.');
        }
    };


    const handleRemoveItem = (index: number): void => {
        const updatedItems = items.filter((_, i) => i !== index);
        setItems(updatedItems);
        const updatedFavorites = favoriteItems.filter(favItem => favItem.name !== items[index].name);
        setFavoriteItems(updatedFavorites);
        notify('Item removed.');
        setIsChangesMade(true);
    };

    const saveToLocalStorage = (): void => {
        if (isChangeMade) {
            setItem('favorites', favoriteItems);
            setItem('categories', categories);
            setItem('cart', cartItems);
            setItem('budget', budget.toString());
            setItem('items', items);
            notify('Changes saved.');
            setIsChangesMade(false);
        } else {
            notify('No changes made.');
        }
    };

    const updateAppStateFromLocalStorage = (): void => {
        const savedItems = getItem('items');
        const savedFavoriteItems = getItem('favorites');
        const savedCategories = getCategory('categories');
        const savedBudget = parseFloat(getItem('budget')) || 0;
        const savedCartItems = getItem('cart');

        setItems(savedItems || initialItems);
        setFavoriteItems(savedFavoriteItems || []);
        setCategories(savedCategories || initialCategories);
        setBudget(savedBudget);
        setCartItems(savedCartItems || []);
    };

    const handleAddToCart = (item: ItemProps): void => {
        const existingCartItemIndex = cartItems.findIndex(cartItem => cartItem.name === item.name);

        if (existingCartItemIndex !== -1) {
            const updatedCartItems = [...cartItems];
            updatedCartItems[existingCartItemIndex].quantity += 1;
            setCartItems(updatedCartItems);
        } else {
            setCartItems([...cartItems, { ...item, quantity: 1 }]);
        }

        notify("Item added to cart.");
        setIsChangesMade(true);
    };

    const handleRemoveSingleItemFromCart = (index: number): void => {
        const updatedCartItems = [...cartItems];
        updatedCartItems[index].quantity -= 1;

        if (updatedCartItems[index].quantity <= 0) {
            updatedCartItems.splice(index, 1);
        }

        setCartItems(updatedCartItems);
        notify("Item removed from cart.");
        setIsChangesMade(true);
    };

    const handleItemRemoveFromCart = (index: number): void => {
        const updatedCartItems = cartItems.filter((_, i) => i !== index);
        setCartItems(updatedCartItems);
        notify("Item overall removed from cart.");
        setIsChangesMade(true);
    };

    const isBudgetExceeded = (): boolean => {
        const cartTotalPrice = cartItems.reduce((total, item) => total + item.quantity * item.price, 0);
        return cartTotalPrice > budget;
    };

    const handleAddCategory = (): void => {
        if (newCategory.trim() !== '') {
            setCategories([...categories, newCategory]);
            setNewCategory('');
            setIsChangesMade(true);
            notify('Category added.');
        } else {
            notify('Please enter a valid category name.');
        }
    };

    const handleRemoveCategory = (category: string): void => {
        const updatedCategories = categories.filter(cat => cat !== category);
        setCategories(updatedCategories);
        setItems(items.map(item => item.category === category ? { ...item, category: '' } : item));
        setIsChangesMade(true);
        notify('Category deleted.');
    };

    return (
        <div className="home-page">
            <h1>Targeted Shopping List</h1>
            <Notification message={notification || ''} type={notification ? 'success' : 'error'} />
            <FavoritesList favoriteItems={favoriteItems} onRemove={handleRemoveFavorite} onAddToCart={handleAddToCart} />
            <ItemList
                items={items}
                onAddFavorite={handleAddFavorite}
                onRemove={handleRemoveItem}
                onAddToCart={handleAddToCart}
                onRemoveCategory={handleRemoveCategory}
                categories={categories}
            />
            <div className="cart">
                <div className='cart-container'>
                    <h2>Cart</h2>
                    <ul>
                        {cartItems.map((item, index) => (
                            <li key={index}>
                                {item.name} - {item.category && `Category: ${item.category} -`} Quantity: {item.quantity} - Price: ${item.price.toFixed(2)} -
                                Total Price: ${(item.quantity * item.price).toFixed(2)}
                                <button onClick={() => handleItemRemoveFromCart(index)}>Remove All Item</button>
                                <button onClick={() => handleRemoveSingleItemFromCart(index)}>Remove One Item</button>
                            </li>
                        ))}
                    </ul>
                    <p>Overall Price: ${cartItems.reduce((total, item) => total + item.quantity * item.price, 0).toFixed(2)}</p>
                    {budget > 0 && (
                        <p className={isBudgetExceeded() ? 'budget-exceeded' : 'budget-not-exceeded'}>
                            {isBudgetExceeded() ? 'Budget Exceeded!' : 'Budget Not Exceeded'}
                        </p>
                    )}
                </div>
            </div>
            <div className='budget-container'>
                <div className="budget">
                    <h2>Set Budget</h2>
                    <input
                        type="number"
                        placeholder="Budget"
                        value={budget}
                        onChange={(e) => {
                            const enteredValue = parseFloat(e.target.value);
                            if (!isNaN(enteredValue) && enteredValue >= 0) {
                                setBudget(enteredValue);
                            }
                        }}
                    />
                </div>
            </div>
            <div className="add-item">
                <h2>Add New Item</h2>
                <input
                    type="text"
                    placeholder="Item name"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Enter quantity..."
                    value={newItem.quantity}
                    onChange={(e) =>
                        setNewItem({
                            ...newItem,
                            quantity: Math.max(0, parseInt(e.target.value)),
                        })
                    }
                />
                <input
                    type="number"
                    placeholder="Enter price..."
                    value={newItem.price}
                    onChange={(e) =>
                        setNewItem({
                            ...newItem,
                            price: Math.max(0, parseFloat(e.target.value)),
                        })
                    }
                />
                <input
                    type="text"
                    placeholder="Category (optional)"
                    value={newItem.category || ''}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                />
                <button onClick={handleAddItemtoCategory}>Add Item</button>
            </div>
            <div className="add-category">
                <h2>Add New Category</h2>
                <input
                    type="text"
                    placeholder="Category name"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                />
                <button onClick={handleAddCategory}>Add Category</button>
            </div>
            <button onClick={saveToLocalStorage} style={{ marginTop: '10px' }}>Save Changes</button>
        </div>
    );
};

export default HomePage;