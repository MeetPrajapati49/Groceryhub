import React, { useEffect, useState } from "react";
import axios from "axios";

function Cart() {
  const [items, setItems] = useState([]); // ✅ Only store items, no extra object

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/cart", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setItems(res.data.items || []); // ✅ Directly set items
      } catch (err) {
        console.error("Failed to fetch cart:", err);
        setItems([]);
      }
    };
    fetchCart();
  }, []);

  return (
    <div>
      <h2>Your Cart</h2>
      {items.length === 0 ? (
        <p>No items in your cart.</p>
      ) : (
        <ul>
          {items.map((i) => (
            <li key={i.product?._id}>
              {i.product?.name} — {i.quantity}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Cart;
