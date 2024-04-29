with "stock" as 
  (select "ingredient_batch"."id",
          + "ingredient_batch"."full_amount"
          - COALESCE(sum("r_ingredient_batch_ingredient_batch"."amount_used") ,0)
          - COALESCE(sum("r_product_batch_ingredient_batch"."amount_used") ,0)
          + COALESCE("ingredient_batch"."adjustment", 0) as "currently_available" 
  from "ingredient_batch" 
  left join "r_ingredient_batch_ingredient_batch" 
    on "r_ingredient_batch_ingredient_batch"."used_batch_id" = "ingredient_batch"."id" 
  left join "ingredient_batch" "batches_in_production" 
    on "r_ingredient_batch_ingredient_batch"."produced_batch_id" = "batches_in_production"."id" 
  left join "r_product_batch_ingredient_batch" 
    on "r_product_batch_ingredient_batch"."ingredient_batch_id" = "ingredient_batch"."id" 
  where "ingredient_batch"."state" = 'AVAILABLE' group by "ingredient_batch"."id") 

  select "ingredient"."id", "ingredient"."name", "ingredient"."unit", "ingredient"."reorder_point", 
    COALESCE(sum("currently_available"), 0) 
  from "ingredient" 
  left join "ingredient_batch" 
    on ("ingredient_batch"."ingredient_id" = "ingredient"."id" and "ingredient_batch"."state" = 'AVAILABLE') 
  left join "stock" 
    on "stock"."id" = "ingredient_batch"."id" 
  group by "ingredient"."id"
