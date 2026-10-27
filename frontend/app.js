const productsElement = document.getElementById("products");
const statusElement = document.getElementById("status");
const refreshButton = document.getElementById("refresh-button");

async function loadProducts() {
  refreshButton.disabled = true;
  statusElement.textContent = "Loading products...";
  productsElement.replaceChildren();

  try {
    const response = await fetch("/api/products");

    if (!response.ok) {
      throw new Error(`API returned HTTP ${response.status}`);
    }

    const products = await response.json();

    if (products.length === 0) {
      statusElement.textContent = "No products available.";
      return;
    }

    for (const product of products) {
      const card = document.createElement("article");
      card.className = "product";

      const name = document.createElement("h3");
      name.textContent = product.name;

      const description = document.createElement("p");
      description.textContent = product.description || "";

      const price = document.createElement("p");
      price.className = "price";
      price.textContent =
        `₹${Number(product.price).toLocaleString("en-IN", {
          minimumFractionDigits: 2
        })}`;

      const button = document.createElement("button");
      button.textContent = "Place test order";

      button.addEventListener("click", async () => {
        button.disabled = true;

        try {
          const orderResponse = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.id,
              quantity: 1
            })
          });

          const result = await orderResponse.json();

          if (!orderResponse.ok) {
            throw new Error(result.error || "Order failed");
          }

          alert(`Order created! Your order ID is ${result.orderId}`);
        } catch (error) {
          alert(error.message);
        } finally {
          button.disabled = false;
        }
      });

      card.append(name, description, price, button);
      productsElement.appendChild(card);
    }

    statusElement.textContent = `${products.length} products loaded.`;
  } catch (error) {
    statusElement.textContent =
      `Unable to load products: ${error.message}`;
  } finally {
    refreshButton.disabled = false;
  }
}

document.getElementById("order-form").addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const id = document.getElementById("order-id").value;
    const resultElement = document.getElementById("order-result");
    resultElement.textContent = "Loading order...";

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(id)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order lookup failed");
      }

      resultElement.textContent = JSON.stringify(data, null, 2);
    } catch (error) {
      resultElement.textContent = error.message;
    }
  }
);

refreshButton.addEventListener("click", loadProducts);
loadProducts();