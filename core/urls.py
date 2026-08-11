from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/clientes/', include('clientes.urls')),
    path('api/proveedores/', include('proveedores.urls')),
    path('api/productos/', include('productos.urls')),
    path('api/documentos/', include('documentos.urls')),
    path('api/detalle-documentos/', include('detalle_documento.urls')),
    
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]

