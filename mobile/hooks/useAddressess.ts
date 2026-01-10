import { useApi } from "@/lib/api"
import { Address } from "@/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useAddresses =()=>{
    const api = useApi();
    const queryClient = useQueryClient();

    const {
        data: addresses,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["addresses"],
        queryFn: async ()=>{
            const { data } = await api.get<{addresses: Address[]}>("/users/addresses");
            return data.addresses;
        }
    });

    const addAddressMutation  = useMutation({
        mutationFn: async (addressData: Omit<Address,"_id">)=>{
            const { data } = await api.post<{addresses: Address[] }>("/users/addresses",addressData);
            return data.addresses;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({ queryKey:["addresses"] });
        }
    });

    const updateAddrssMutation = useMutation({
        mutationFn: async({
            addressId,
            addressData,
        } : {
            addressId: string,
            addressData: Partial<Address>;
        }) =>{
            const { data } = await api.put<{ addresses: Address[] }>(
                `/users/addresses/${addressId}`,
                addressData
            );
            return data.addresses;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({ queryKey:["addresses"]});
        },
    });

    const deleteAddessMutation = useMutation({
        mutationFn: async (addressId: string) =>{
            const { data } = await api.delete<{ addresses: Address[]}>(`/users/addresses/${addressId}`);
            return data.addresses;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({ queryKey:["addresses"] });
        },
    });

    return {
        addresses: addresses || [],
        isLoading,
        isError,
        addAddresses: addAddressMutation.mutate,
        updateAddress: updateAddrssMutation.mutate,
        deleteAddress: deleteAddessMutation.mutate,
        isAddingAddress: addAddressMutation.isPending,
        isUpdatingAddress: updateAddrssMutation.isPending,
        isDeletingAddress: deleteAddessMutation.isPending,
    };
};