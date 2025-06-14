from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from database import get_all_products

class ContentRecommender:
    def __init__(self):
        self.products = get_all_products()
        self.tfidf_matrix = None
        self.cosine_sim = None
        self._build_model()

    def _build_model(self):
        tfidf = TfidfVectorizer(stop_words='english')
        metadata = [f"{p.name} {p.category} {p.tags}" for p in self.products]
        self.tfidf_matrix = tfidf.fit_transform(metadata)
        self.cosine_sim = cosine_similarity(self.tfidf_matrix, self.tfidf_matrix)

    def recommend(self, product_id: int, top_n=3):
        idx = next((i for i, p in enumerate(self.products) if p.id == product_id), None)
        if idx is None:
            return []

        sim_scores = list(enumerate(self.cosine_sim[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_n+1]  # exclude itself
        product_indices = [i[0] for i in sim_scores]
        return [self.products[i] for i in product_indices]