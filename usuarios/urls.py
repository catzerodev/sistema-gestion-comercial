from django.urls import path

from .views import RegistroUsuarioView, LoginView, RefreshTokenView


urlpatterns = [
    path('registro/', RegistroUsuarioView.as_view(), name='registro'),
    path('login/', LoginView.as_view(), name='login'),
    path('refresh/', RefreshTokenView.as_view(), name='refresh'),
]