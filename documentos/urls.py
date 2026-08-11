from django.urls import path
from .views import DocumentoListCreateView, DocumentoDetailView


urlpatterns = [
    path('', DocumentoListCreateView.as_view(), name='documentos-list-create'),
    path('<int:pk>/', DocumentoDetailView.as_view(), name='documentos-detail'),
]

