from rest_framework import generics
from .models import Documento
from .serializers import DocumentoSerializer


class DocumentoListCreateView(generics.ListCreateAPIView):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer


class DocumentoDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Documento.objects.all()
    serializer_class = DocumentoSerializer