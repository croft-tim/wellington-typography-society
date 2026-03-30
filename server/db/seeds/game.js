export async function seed(knex) {
  // Delete in reverse dependency order
  await knex('player_unlocked_exits').del()
  await knex('player_visited_locations').del()
  await knex('player_progress').del()
  await knex('riddles').del()
  await knex('exits').del()
  await knex('location_tokens').del()
  await knex('locations').del()

  // --- Locations ---
  // 3x3 grid: x = street column (0=Taranaki, 1=Tory, 2=Cuba)
  //           y = street row    (0=Dixon,   1=Leeds, 2=Ghuznee)
  //
  //   x=0 (Taranaki)   x=1 (Tory)   x=2 (Cuba)
  // y=0 [dixon-taranaki] [dixon-tory] [dixon-cuba]
  // y=1 [leeds-taranaki] [leeds-tory] [leeds-cuba]  ← starting node
  // y=2 [ghuznee-taranaki] [ghuznee-tory] [ghuznee-cuba]

  await knex('locations').insert([
    {
      id: 1,
      slug: 'dixon-taranaki',
      name: 'Dixon & Taranaki',
      description:
        'A corner unremarkable to most. To you, now, it hums with intent. Someone chose this intersection deliberately. The kerning of the streetscape feels almost designed.',
      grid_x: 0,
      grid_y: 0,
    },
    {
      id: 2,
      slug: 'dixon-tory',
      name: 'Dixon & Tory',
      description:
        'The street sign here has been repainted recently. You can see the ghost of an older name beneath it — or perhaps that is the point. Nothing in Te Aro is entirely what it claims to be.',
      grid_x: 1,
      grid_y: 0,
    },
    {
      id: 3,
      slug: 'dixon-cuba',
      name: 'Dixon & Cuba',
      description:
        'Cuba Street runs north from here into the weekend crowds. You are moving against the grain of the city. The Society understood that legibility requires contrast.',
      grid_x: 2,
      grid_y: 0,
    },
    {
      id: 4,
      slug: 'leeds-taranaki',
      name: 'Leeds & Taranaki',
      description:
        'The western edge of the grid. Beyond here, the pattern dissolves. You stand at what the Society called the left margin — where the eye returns after reading each line.',
      grid_x: 0,
      grid_y: 1,
    },
    {
      id: 5,
      slug: 'leeds-tory',
      name: 'Leeds & Tory',
      description:
        'The centre of the grid. Every path passes through here eventually. The Society called this the axis — though axis of what, exactly, remains unclear.',
      grid_x: 1,
      grid_y: 1,
    },
    {
      id: 6,
      slug: 'leeds-cuba',
      name: 'Leeds & Cuba',
      description:
        'The plaza opens around you. Goldings to the north, the smell of woodfired dough from somewhere close. This is where it begins — where they posted the first broadsheet, in a typeface no one could name. You have been handed a letter. You do not yet know which one.',
      grid_x: 2,
      grid_y: 1,
    },
    {
      id: 7,
      slug: 'ghuznee-taranaki',
      name: 'Ghuznee & Taranaki',
      description:
        'Few people come this far. The grid thins out here, the hospitality strip giving way to something quieter and less certain. You have the feeling of being at the bottom of a page.',
      grid_x: 0,
      grid_y: 2,
    },
    {
      id: 8,
      slug: 'ghuznee-tory',
      name: 'Ghuznee & Tory',
      description:
        'A loading bay. Peeling signage. The kind of wall that accumulates layers — wheat-paste over wheat-paste over paint over brick. You notice the letterforms even now. Especially now.',
      grid_x: 1,
      grid_y: 2,
    },
    {
      id: 9,
      slug: 'ghuznee-cuba',
      name: 'Ghuznee & Cuba',
      description:
        'South of the plaza the street changes register. The font, if there is one, would live here — in the gap between the known and the named. You are reading something. You are not sure it has words yet.',
      grid_x: 2,
      grid_y: 2,
    },
  ])

  // --- Location tokens (QR code UUIDs) ---
  await knex('location_tokens').insert([
    { id: 1, location_id: 1, token: 'a1000000-0000-0000-0000-000000000001' },
    { id: 2, location_id: 2, token: 'a1000000-0000-0000-0000-000000000002' },
    { id: 3, location_id: 3, token: 'a1000000-0000-0000-0000-000000000003' },
    { id: 4, location_id: 4, token: 'a1000000-0000-0000-0000-000000000004' },
    { id: 5, location_id: 5, token: 'a1000000-0000-0000-0000-000000000005' },
    { id: 6, location_id: 6, token: 'a1000000-0000-0000-0000-000000000006' },
    { id: 7, location_id: 7, token: 'a1000000-0000-0000-0000-000000000007' },
    { id: 8, location_id: 8, token: 'a1000000-0000-0000-0000-000000000008' },
    { id: 9, location_id: 9, token: 'a1000000-0000-0000-0000-000000000009' },
  ])

  // --- Exits ---
  // Two rows per connection (one each direction).
  // Direction convention: north = decreasing y, south = increasing y, east = increasing x, west = decreasing x
  //
  // One locked exit: leeds-cuba (6) → ghuznee-cuba (9), direction south
  await knex('exits').insert([
    // Dixon row (y=0) — east/west
    { id: 1,  from_location_id: 1, to_location_id: 2, direction: 'east',  is_locked: false }, // dixon-taranaki → dixon-tory
    { id: 2,  from_location_id: 2, to_location_id: 1, direction: 'west',  is_locked: false }, // dixon-tory → dixon-taranaki
    { id: 3,  from_location_id: 2, to_location_id: 3, direction: 'east',  is_locked: false }, // dixon-tory → dixon-cuba
    { id: 4,  from_location_id: 3, to_location_id: 2, direction: 'west',  is_locked: false }, // dixon-cuba → dixon-tory

    // Leeds row (y=1) — east/west
    { id: 5,  from_location_id: 4, to_location_id: 5, direction: 'east',  is_locked: false }, // leeds-taranaki → leeds-tory
    { id: 6,  from_location_id: 5, to_location_id: 4, direction: 'west',  is_locked: false }, // leeds-tory → leeds-taranaki
    { id: 7,  from_location_id: 5, to_location_id: 6, direction: 'east',  is_locked: false }, // leeds-tory → leeds-cuba
    { id: 8,  from_location_id: 6, to_location_id: 5, direction: 'west',  is_locked: false }, // leeds-cuba → leeds-tory

    // Ghuznee row (y=2) — east/west
    { id: 9,  from_location_id: 7, to_location_id: 8, direction: 'east',  is_locked: false }, // ghuznee-taranaki → ghuznee-tory
    { id: 10, from_location_id: 8, to_location_id: 7, direction: 'west',  is_locked: false }, // ghuznee-tory → ghuznee-taranaki
    { id: 11, from_location_id: 8, to_location_id: 9, direction: 'east',  is_locked: false }, // ghuznee-tory → ghuznee-cuba
    { id: 12, from_location_id: 9, to_location_id: 8, direction: 'west',  is_locked: false }, // ghuznee-cuba → ghuznee-tory

    // Taranaki column (x=0) — north/south
    { id: 13, from_location_id: 1, to_location_id: 4, direction: 'south', is_locked: false }, // dixon-taranaki → leeds-taranaki
    { id: 14, from_location_id: 4, to_location_id: 1, direction: 'north', is_locked: false }, // leeds-taranaki → dixon-taranaki
    { id: 15, from_location_id: 4, to_location_id: 7, direction: 'south', is_locked: false }, // leeds-taranaki → ghuznee-taranaki
    { id: 16, from_location_id: 7, to_location_id: 4, direction: 'north', is_locked: false }, // ghuznee-taranaki → leeds-taranaki

    // Tory column (x=1) — north/south
    { id: 17, from_location_id: 2, to_location_id: 5, direction: 'south', is_locked: false }, // dixon-tory → leeds-tory
    { id: 18, from_location_id: 5, to_location_id: 2, direction: 'north', is_locked: false }, // leeds-tory → dixon-tory
    { id: 19, from_location_id: 5, to_location_id: 8, direction: 'south', is_locked: false }, // leeds-tory → ghuznee-tory
    { id: 20, from_location_id: 8, to_location_id: 5, direction: 'north', is_locked: false }, // ghuznee-tory → leeds-tory

    // Cuba column (x=2) — north/south
    { id: 21, from_location_id: 3, to_location_id: 6, direction: 'south', is_locked: false }, // dixon-cuba → leeds-cuba
    { id: 22, from_location_id: 6, to_location_id: 3, direction: 'north', is_locked: false }, // leeds-cuba → dixon-cuba
    { id: 23, from_location_id: 6, to_location_id: 9, direction: 'south', is_locked: true  }, // leeds-cuba → ghuznee-cuba (LOCKED)
    { id: 24, from_location_id: 9, to_location_id: 6, direction: 'north', is_locked: false }, // ghuznee-cuba → leeds-cuba
  ])

  // --- Riddle for the locked exit (exit id 23: leeds-cuba → ghuznee-cuba) ---
  await knex('riddles').insert([
    {
      id: 1,
      exit_id: 23,
      question:
        'The Society's first broadsheet was set in a typeface with no name — only a number. That number was also the year the Cuba Street Carnival first ran. What is it?',
      answer: '1996',
      hint: 'The carnival began in the mid-nineties. The year is in the official record, if you know where to look.',
      failure_message:
        'You try "{answer}" on the mechanism. The lock does not respond. The number means something, but not this.',
    },
  ])
}
