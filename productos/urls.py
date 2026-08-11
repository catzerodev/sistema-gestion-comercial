from django.urls import path
from .views import ProductoListCreateView, ProductoDetailView

urlpatterns = [
    path('', ProductoListCreateView.as_view(), name='productos-list-create'),
    path('<int:pk>/', ProductoDetailView.as_view(), name='productos-detail'),
]

