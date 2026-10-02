// Productos por restaurante.
// Cuando el backend esté listo: GET /api/cliente/restaurantes/{id}/productos

export const PRODUCTOS_POR_RESTAURANTE = {
	// 🍔 Burger Artisan Lab
	1: [
		{
			id_producto: 1,
			nombre: 'Doble Bacon Smash Burger',
			descripcion: 'Doble carne smash 100g, queso cheddar fundido, tocineta ahumada y salsa de la casa.',
			precio: 8.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			badge: 'Popular',
			imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80'
		},
		{
			id_producto: 2,
			nombre: 'Truffle Mushroom Burger',
			descripcion: 'Carne angus, queso suizo emmental, hongos portobello y mayonesa trufada.',
			precio: 9.2,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=300&q=80'
		},
		{
			id_producto: 3,
			nombre: 'Classic Cheeseburger',
			descripcion: 'Carne Angus 160g, cheddar madurado, lechuga, tomate y salsa de la casa.',
			precio: 6.9,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=300&q=80'
		},
		{
			id_producto: 4,
			nombre: 'Papas Rústicas Trufadas',
			descripcion: 'Corte artesanal con piel, aceite de trufa blanca, parmesano y perejil.',
			precio: 3.2,
			exento_iva: false,
			disponible: true,
			categoria: 'Acompañantes',
			imagen: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=300&q=80'
		},
		{
			id_producto: 5,
			nombre: 'Aros de Cebolla Crunch',
			descripcion: 'Aros gruesos rebozados con cerveza rubia y panko japonés.',
			precio: 2.8,
			exento_iva: false,
			disponible: true,
			categoria: 'Acompañantes',
			imagen: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=300&q=80'
		},
		{
			id_producto: 6,
			nombre: 'Bebida Refrescante 500ml',
			descripcion: 'Té artesanal de durazno o limonada de hierbabuena.',
			precio: 1.8,
			exento_iva: false,
			disponible: true,
			categoria: 'Bebidas',
			imagen: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=300&q=80'
		},
		{
			id_producto: 7,
			nombre: 'Malta Artesanal 355ml',
			descripcion: 'Bebida de malta venezolana tradicional sin alcohol.',
			precio: 1.8,
			exento_iva: true,
			disponible: true,
			categoria: 'Bebidas',
			imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&q=80'
		}
	],

	// 🍔 Burger District Co.
	2: [
		{
			id_producto: 10,
			nombre: 'Doble Bacon Melt',
			descripcion: 'Doble carne, cheddar fundido, bacon crujiente y salsa BBQ.',
			precio: 9.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			badge: 'Top Ventas',
			imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&q=80'
		},
		{
			id_producto: 11,
			nombre: 'Papas Rústicas XL',
			descripcion: 'Porción grande con alioli de ajo y paprika.',
			precio: 4.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Acompañantes',
			imagen: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=300&q=80'
		}
	],

	// 🍔 La Birra Bar
	3: [
		{
			id_producto: 20,
			nombre: 'Triple Smash Burger',
			descripcion: 'Tres carnes smash, tres quesos, bacon y cebolla crispy.',
			precio: 11.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=300&q=80'
		},
		{
			id_producto: 21,
			nombre: 'Cerveza Artesanal IPA',
			descripcion: 'IPA local de 355ml.',
			precio: 3.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Bebidas',
			imagen: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=300&q=80'
		}
	],

	// 🍕 Bella Napoli Trattoria
	4: [
		{
			id_producto: 30,
			nombre: 'Pizza Margherita D.O.P',
			descripcion: 'Mozzarella di bufala, tomate San Marzano y albahaca fresca.',
			precio: 11.2,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			badge: 'Más pedido',
			imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&q=80'
		},
		{
			id_producto: 31,
			nombre: 'Pizza Cuatro Quesos',
			descripcion: 'Gorgonzola, mozzarella, parmesano y ricotta.',
			precio: 13.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=300&q=80'
		},
		{
			id_producto: 32,
			nombre: 'Focaccia Romero',
			descripcion: 'Pan casero con romero, aceite de oliva y sal marina.',
			precio: 4.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Acompañantes',
			imagen: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=300&q=80'
		}
	],

	// 🍕 Napoletana Forno
	5: [
		{
			id_producto: 40,
			nombre: 'Pizza Pepperoni',
			descripcion: 'Pepperoni picante, mozzarella y orégano.',
			precio: 12.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=80'
		}
	],

	// 🌮 Tacos El Auténtico
	6: [
		{
			id_producto: 50,
			nombre: 'Tacos al Pastor (x3)',
			descripcion: 'Cerdo marinado, piña, cilantro y cebolla en tortilla de maíz.',
			precio: 6.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			badge: 'Más pedido',
			imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=300&q=80'
		},
		{
			id_producto: 51,
			nombre: 'Guacamole con Totopos',
			descripcion: 'Guacamole fresco con totopos de maíz.',
			precio: 4.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Acompañantes',
			imagen: 'https://images.unsplash.com/photo-1600335895229-6e75511892c8?w=300&q=80'
		}
	],

	// 🌮 La Taquería
	7: [
		{
			id_producto: 60,
			nombre: 'Burrito Grande',
			descripcion: 'Carne, arroz, frijoles, queso y guacamole.',
			precio: 8.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&q=80'
		}
	],

	// 🍣 Tokyo Sushi Bar (CERRADO)
	8: [
		{
			id_producto: 70,
			nombre: 'Roll California Ebi',
			descripcion: 'Cangrejo, aguacate, pepino y tobiko.',
			precio: 10.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&q=80'
		}
	],

	// 🍣 Haru Sushi Bar
	9: [
		{
			id_producto: 80,
			nombre: 'Sushi Premium 20 pzs',
			descripcion: 'Selección del chef con salmón, atún y camarón.',
			precio: 22.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?w=300&q=80'
		}
	],

	// 🥗 Green Bowl Deli
	10: [
		{
			id_producto: 90,
			nombre: 'Poke Bowl Salmón Fresh',
			descripcion: 'Salmón fresco, quinoa, aguacate, edamame y sésamo.',
			precio: 9.9,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			badge: 'Favorito',
			imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'
		},
		{
			id_producto: 91,
			nombre: 'Salad Bowl Quinoa',
			descripcion: 'Quinoa, aguacate, tomate cherry, garbanzos y aderezo de limón.',
			precio: 8.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&q=80'
		}
	],

	// 🥗 Poke Life
	11: [
		{
			id_producto: 100,
			nombre: 'Poke Atún Spicy',
			descripcion: 'Atún fresco, arroz, mango, aguacate y salsa sriracha.',
			precio: 10.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&q=80'
		}
	],

	// ☕ Cafeína Roast & Bakery
	12: [
		{
			id_producto: 110,
			nombre: 'Flat White + Croissant',
			descripcion: 'Combo de flat white con croissant de almendra.',
			precio: 5.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&q=80'
		},
		{
			id_producto: 111,
			nombre: 'Cappuccino Vainilla',
			descripcion: 'Cappuccino con sirope de vainilla.',
			precio: 3.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Bebidas',
			imagen: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=300&q=80'
		}
	],

	// ☕ Dulce Deleite Bakery
	13: [
		{
			id_producto: 120,
			nombre: 'Cheesecake Nueva York',
			descripcion: 'Cheesecake clásico con coulis de frutos rojos.',
			precio: 5.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=300&q=80'
		}
	],

	// 🍗 Crispy Chicken Co.
	14: [
		{
			id_producto: 130,
			nombre: 'Crispy Chicken Burger',
			descripcion: 'Pechuga crujiente, lechuga, pepinillos y mayo de ajo.',
			precio: 7.9,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=300&q=80'
		}
	],

	// 🍗 Pollo Frito Express (CERRADO)
	15: [
		{
			id_producto: 140,
			nombre: 'Combo 8 piezas',
			descripcion: '8 piezas de pollo frito + papas + refresco.',
			precio: 15.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?w=300&q=80'
		}
	],

	// 🥟 Wok Express Asiático
	16: [
		{
			id_producto: 150,
			nombre: 'Pad Thai Mixto',
			descripcion: 'Fideos de arroz, camarones, pollo y cacahuetes.',
			precio: 9.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=300&q=80'
		},
		{
			id_producto: 151,
			nombre: 'Rollitos Primavera x4',
			descripcion: 'Rollitos crujientes con salsa agridulce.',
			precio: 4.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Acompañantes',
			imagen: 'https://images.unsplash.com/photo-1625938145314-9b1a6b5b1c2e?w=300&q=80'
		}
	],

	// 🥟 Tokyo Ramen Bar (CERRADO)
	17: [
		{
			id_producto: 160,
			nombre: 'Ramen Tonkotsu',
			descripcion: 'Caldo de cerdo, chashu, huevo marinado y nori.',
			precio: 12.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=300&q=80'
		}
	],

	// 🇻🇪 Arepa House
	18: [
		{
			id_producto: 170,
			nombre: 'Arepa Reina Pepiada',
			descripcion: 'Pollo, aguacate y mayonesa.',
			precio: 5.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&q=80'
		},
		{
			id_producto: 171,
			nombre: 'Arepa Pelúa',
			descripcion: 'Carne mechada y queso amarillo.',
			precio: 6.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=300&q=80'
		}
	],

	// 🇻🇪 El Rincón Criollo
	19: [
		{
			id_producto: 180,
			nombre: 'Pabellón Criollo',
			descripcion: 'Carne mechada, caraotas, arroz y tajadas.',
			precio: 8.5,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=300&q=80'
		}
	],

	// 🦐 Mariscos del Caribe
	20: [
		{
			id_producto: 190,
			nombre: 'Ceviche de Camarón',
			descripcion: 'Camarones frescos, limón, cebolla morada y cilantro.',
			precio: 12.0,
			exento_iva: false,
			disponible: true,
			categoria: 'Populares',
			imagen: 'https://images.unsplash.com/photo-1559737558-2f5a35f4523b?w=300&q=80'
		}
	]
};