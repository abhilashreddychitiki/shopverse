/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use server";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { signIn, signOut, auth } from "@/auth";
import {
  signInFormSchema,
  signUpFormSchema,
  shippingAddressSchema,
  paymentMethodSchema,
  updateUserSchema,
} from "../validator";
import { prisma } from "@/db/prisma";
import { hashSync } from "bcrypt-ts-edge";
import { formatError } from "../utils";
import { z } from "zod";
import { ShippingAddress } from "@/types";
import { PAGE_SIZE } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function signInWithCredentials(
  _prevState: unknown,
  formData: FormData
) {
  try {
    const user = signInFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    await signIn("credentials", user);
    return { success: true, message: "signed in successfully" };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: "Invalid email or password" };
  }
}
export async function signOutUser() {
  await signOut({ redirectTo: "/" });
}
export async function signUp(_prevState: unknown, formData: FormData) {
  try {
    const user = signUpFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      confirmPassword: formData.get("confirmPassword"),
      password: formData.get("password"),
    });

    const plainPassword = user.password;

    user.password = hashSync(user.password, 10);

    await prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
      },
    });

    await signIn("credentials", {
      email: user.email,
      password: plainPassword,
    });

    return { success: true, message: "User created successfully" };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: formatError(error),
    };
  }
}
// Get user by ID
export async function getUserById(userId: string) {
  const user = await prisma.user.findFirst({
    where: { id: userId },
  });

  if (!user) throw new Error("User not found");
  return user;
}

// Update user's address
export async function updateUserAddress(data: ShippingAddress) {
  try {
    const session = await auth();

    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id! },
    });

    if (!currentUser) throw new Error("User not found");

    const address = shippingAddressSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { address },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's payment method
export async function updateUserPaymentMethod(
  data: z.infer<typeof paymentMethodSchema>
) {
  try {
    const session = await auth();
    const currentUser = await prisma.user.findFirst({
      where: { id: session?.user?.id! },
    });

    if (!currentUser) throw new Error("User not found");

    const paymentMethod = paymentMethodSchema.parse(data);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: { paymentMethod: paymentMethod.type },
    });

    return {
      success: true,
      message: "User updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Update user's profile
export async function updateProfile({ name }: { name: string }) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("User not authenticated");

    const currentUser = await prisma.user.findFirst({
      where: { id: session.user.id },
    });

    if (!currentUser) throw new Error("User not found");

    // Validate name
    if (name.length < 3) {
      return {
        success: false,
        message: "Name must be at least 3 characters",
      };
    }

    // Update user
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { name },
    });

    return {
      success: true,
      message: "Profile updated successfully",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// Get all users
export async function getAllUsers({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  // Build where conditions based on filters
  const where: Record<string, any> = {};

  // Add name or email search if query is provided
  if (query) {
    where.OR = [
      {
        name: {
          contains: query,
          mode: "insensitive", // Case-insensitive search
        },
      },
      {
        email: {
          contains: query,
          mode: "insensitive", // Case-insensitive search
        },
      },
    ];
  }

  const data = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.user.count({ where });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
    totalUsers: dataCount,
  };
}

// Delete User (Admin)
export async function deleteUser(userId: string) {
  try {
    // Check if the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Don't allow deleting admin users
    if (user.role === "admin") {
      return { success: false, message: "Cannot delete admin users" };
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });

    // Revalidate the admin users page
    revalidatePath("/admin/users");

    return { success: true, message: "User deleted successfully" };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: formatError(error) };
  }
}

// Update User (Admin)
export async function updateUser(data: z.infer<typeof updateUserSchema>) {
  try {
    // Validate data
    const validatedData = updateUserSchema.parse(data);

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: validatedData.id },
    });

    if (!userExists) {
      return { success: false, message: "User not found" };
    }

    // Update user
    await prisma.user.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        role: validatedData.role,
      },
    });

    // Revalidate paths
    revalidatePath(`/admin/users/${validatedData.id}`);
    revalidatePath("/admin/users");

    return { success: true, message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, message: formatError(error) };
  }
}
