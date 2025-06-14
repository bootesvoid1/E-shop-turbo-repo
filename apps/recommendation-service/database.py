from models import ProductModel


products_db = [
    ProductModel(id=1, name="Wireless Headphones", category="Electronics", tags="audio bluetooth headphones"),
    ProductModel(id=2, name="Smartphone", category="Electronics", tags="mobile phone android"),
    ProductModel(id=3, name="Laptop", category="Electronics", tags="computer laptop windows"),
    ProductModel(id=4, name="Running Shoes", category="Sports", tags="shoes running sports"),
    ProductModel(id=5, name="T-Shirt Cotton", category="Clothing", tags="shirt cotton casual"),
]

def get_product_by_id(product_id: int):
    for p in products_db:
        if p.id == product_id:
            return p
    return None

def get_all_products():
    return products_db