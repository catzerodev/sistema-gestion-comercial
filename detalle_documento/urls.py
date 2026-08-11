from django.urls import path
from .views import DetalleDocumentoListCreateView, DetalleDocumentoDetailView


urlpatterns = [
    path('', DetalleDocumentoListCreateView.as_view(), name='detalle-documento-list-create'),
    path('<int:pk>/', DetalleDocumentoDetailView.as_view(), name='detalle-documento-detail'),
]