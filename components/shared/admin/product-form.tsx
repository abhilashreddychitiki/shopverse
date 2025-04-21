"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createProduct, updateProduct } from "@/lib/actions/product.actions";
import { productDefaultValues } from "@/lib/constants";
import { insertProductSchema, updateProductSchema } from "@/lib/validator";
import { ControllerRenderProps } from "react-hook-form";
import { Product } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import slugify from "slugify";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useTransition } from "react";
import { z } from "zod";
import { SubmitHandler } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { UploadButton } from "@/lib/uploadthing";
import { X } from "lucide-react";

const ProductForm = ({
  type,
  product,
  productId,
}: {
  type: "Create" | "Update";
  product?: Product;
  productId?: string;
}) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // We're now using form.watch('images') instead of a separate state
  // Using form.watch instead of useState for isFeatured and banner

  // Handle form submit
  const onSubmit: SubmitHandler<z.infer<typeof insertProductSchema>> = async (
    values
  ) => {
    startTransition(async () => {
      if (type === "Create") {
        // The images are already in the values object from the form
        const productData = {
          ...values,
          // isFeatured and banner are already in the values object from the form
        };

        const res = await createProduct(productData);

        if (!res.success) {
          toast.error(res.message);
        } else {
          toast.success(res.message);
          router.push(`/admin/products`);
          router.refresh();
        }
      }
      if (type === "Update") {
        if (!productId) {
          router.push(`/admin/products`);
          return;
        }

        // The images are already in the values object from the form
        const productData = {
          ...values,
          // isFeatured and banner are already in the values object from the form
        };

        const res = await updateProduct({ ...productData, id: productId });

        if (!res.success) {
          toast.error(res.message);
        } else {
          toast.success(res.message);
          router.push(`/admin/products`);
          router.refresh();
        }
      }
    });
  };

  const form = useForm<z.infer<typeof insertProductSchema>>({
    resolver:
      type === "Update"
        ? zodResolver(updateProductSchema)
        : zodResolver(insertProductSchema),
    defaultValues:
      product && type === "Update" ? product : productDefaultValues,
  });

  const images = form.watch("images");
  const isFeatured = form.watch("isFeatured");
  const banner = form.watch("banner");

  return (
    <Form {...form}>
      <form
        method="post"
        className="space-y-8"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col gap-5 md:flex-row">
          {/* Name */}
          <FormField
            control={form.control}
            name="name"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "name"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Slug */}
          <FormField
            control={form.control}
            name="slug"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "slug"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter product slug"
                      className="pl-8"
                      {...field}
                    />
                    <button
                      type="button"
                      className="bg-gray-500 text-white px-4 py-1 mt-2 hover:bg-gray-600"
                      onClick={() => {
                        form.setValue(
                          "slug",
                          slugify(form.getValues("name"), { lower: true })
                        );
                      }}
                    >
                      Generate
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          {/* Category */}
          <FormField
            control={form.control}
            name="category"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "category"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <Input placeholder="Enter category" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Brand */}
          <FormField
            control={form.control}
            name="brand"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "brand"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Brand</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product brand" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          {/* Price */}
          <FormField
            control={form.control}
            name="price"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "price"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input placeholder="Enter product price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Stock */}
          <FormField
            control={form.control}
            name="stock"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "stock"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Enter product stock"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field flex flex-col gap-5">
          {/* Images */}
          <FormField
            control={form.control}
            name="images"
            render={() => (
              <FormItem className="w-full">
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className="p-4">
                    {/* Display uploaded images */}
                    <div className="flex flex-wrap gap-4 mb-4">
                      {images &&
                        images.length > 0 &&
                        images.map((image: string) => (
                          <div key={image} className="relative w-24 h-24">
                            <Image
                              src={image}
                              alt="product image"
                              fill
                              className="object-cover rounded-md"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                form.setValue(
                                  "images",
                                  images.filter((img: string) => img !== image)
                                );
                              }}
                              className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                    </div>

                    {/* Upload button */}
                    <FormControl>
                      <div className="uploadthing-button">
                        <UploadButton
                          endpoint="imageUploader"
                          onClientUploadComplete={(res: { url: string }[]) => {
                            form.setValue("images", [
                              ...(images || []),
                              res[0].url,
                            ]);
                            toast.success(`Image uploaded successfully`);
                          }}
                          onUploadError={(error: Error) => {
                            toast.error(`ERROR! ${error.message}`);
                          }}
                        />
                      </div>
                    </FormControl>
                  </CardContent>
                </Card>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="upload-field">
          Featured Product
          <Card>
            <CardContent className="space-y-2 mt-2">
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="space-x-2 items-center">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Is Featured?</FormLabel>
                  </FormItem>
                )}
              />
              {isFeatured && banner && (
                <div className="relative">
                  <Image
                    src={banner}
                    alt="banner image"
                    className="w-full object-cover object-center rounded-sm"
                    width={1920}
                    height={680}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue("banner", null);
                      toast.success("Banner image removed");
                    }}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-2 hover:bg-red-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
              {isFeatured && !banner && (
                <UploadButton
                  endpoint="imageUploader"
                  onClientUploadComplete={(res: { url: string }[]) => {
                    form.setValue("banner", res[0].url);
                    toast.success("Banner image uploaded successfully");
                  }}
                  onUploadError={(error: Error) => {
                    toast.error(`ERROR! ${error.message}`);
                  }}
                />
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          {/* Description */}
          <FormField
            control={form.control}
            name="description"
            render={({
              field,
            }: {
              field: ControllerRenderProps<
                z.infer<typeof insertProductSchema>,
                "description"
              >;
            }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          {/* Submit */}
          <Button
            type="submit"
            className="w-full md:w-auto"
            disabled={isPending}
          >
            {isPending
              ? "Saving..."
              : type === "Create"
                ? "Create Product"
                : "Update Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ProductForm;
