update public.spas
set amenities = normalized.mapped_amenities
from (
  select
    spas.id,
    coalesce(
      array(
        select deduped.mapped_value
        from (
          select
            min(mapped.ordinality) as first_position,
            mapped.mapped_value
          from (
            select
              amenity.ordinality,
              case amenity.value
                when '24 hours' then '24 Hours'
                when 'Wireless Internet' then 'Free Wi-Fi'
                when 'Free Wifi' then 'Free Wi-Fi'
                when 'Gendered Separated' then 'Gender-Separated Areas'
                when 'Group Area' then 'Co-Ed Lounge'
                when 'Sauna' then 'Dry Sauna'
                when 'Sleeping Space' then 'Sleeping Area'
                when 'Offers Free Water' then 'Free Drinking Water'
                when 'Korean Scrubs' then 'Korean Body Scrubs'
                when 'Massage Service' then 'Massage Services'
                when 'Reservations' then 'Reservations Required'
                else amenity.value
              end as mapped_value
            from unnest(coalesce(spas.amenities, '{}'::text[])) with ordinality as amenity(value, ordinality)
          ) mapped
          group by mapped.mapped_value
        ) deduped
        order by deduped.first_position
      ),
      '{}'::text[]
    ) as mapped_amenities
  from public.spas
) normalized
where public.spas.id = normalized.id;
