"use client";

import { useState, useCallback } from "react";
import Cropper, { Area } from "react-easy-crop";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Camera, ZoomIn, ZoomOut, Loader2 } from "lucide-react";
import { getCroppedImg } from "@/lib/canvasUtils"; 
import Image from "next/image";

interface AvatarUploadProps {
  currentImageUrl?: string | null;
  onFileSelect: (file: File) => void;
}

export function AvatarUpload({ currentImageUrl, onFileSelect }: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setIsOpen(true); 
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      setIsProcessing(true);
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      
      if (croppedBlob) {
        const file = new File([croppedBlob], "profile-pic.jpg", { type: "image/jpeg" });
        
        const preview = URL.createObjectURL(croppedBlob);
        setPreviewUrl(preview);
        
        onFileSelect(file);
        setIsOpen(false);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-muted bg-muted shadow-sm relative">
            {previewUrl ? (
                 <Image 
                    src={previewUrl} 
                    alt="Foto de Perfil" 
                    fill 
                    className="object-cover"
                 />
            ) : (
                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                    <Camera className="h-10 w-10 opacity-50" />
                </div>
            )}
        </div>
        
        <label 
            htmlFor="avatar-input" 
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full shadow-md cursor-pointer hover:bg-primary/90 transition-colors"
        >
            <Camera className="h-4 w-4" />
            <input
                type="file"
                id="avatar-input"
                accept="image/*"
                onChange={onFileChange}
                className="hidden"
            />
        </label>
      </div>

      <p className="text-sm text-muted-foreground">Clique na câmera para alterar</p>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajustar Foto</DialogTitle>
          </DialogHeader>
          
          <div className="relative w-full h-80 bg-black/5 rounded-md overflow-hidden mt-4">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                cropShape="round" 
                showGrid={false}
              />
            )}
          </div>

          <div className="py-4 flex items-center gap-4">
             <ZoomOut className="h-4 w-4 text-muted-foreground" />
             <Slider 
                value={[zoom]} 
                min={1} 
                max={3} 
                step={0.1} 
                onValueChange={(val) => setZoom(val[0])} 
                className="flex-1"
             />
             <ZoomIn className="h-4 w-4 text-muted-foreground" />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveCrop} disabled={isProcessing}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Foto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}