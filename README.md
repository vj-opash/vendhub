# VendHub - Vending Machine Inventory Management System

A comprehensive inventory management system for vending machine operators, built with Next.js and Supabase.

## Features

- **Multi-Vendor CSV Processing**: Automatically detects and processes sales data from different vending machine providers
- **Real-time Inventory Tracking**: Location-based inventory management with automatic stock level updates
- **Authentication**: Secure user registration and login with Supabase Auth
- **Dashboard Analytics**: Overview of locations, products, sales, and stock levels
- **Mobile-Friendly**: Responsive design optimized for field operations
- **Data Normalization**: Handles different CSV formats and field naming conventions

## Tech Stack

- **Frontend**: Next.js 13, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **UI Components**: shadcn/ui, Radix UI
- **File Processing**: PapaParse for CSV parsing

## Getting Started

### Prerequisites

- Node.js 18+ 
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd vendhub-inventory
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

4. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to the SQL Editor
   - Run the migration files in order:
     - `supabase/migrations/create_schema.sql`
     - `supabase/migrations/seed_data.sql`

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Schema

### Core Tables

- **locations**: Vending machine locations
- **products**: Product catalog with UPC codes
- **inventory**: Location-specific stock levels
- **sales_transactions**: Individual sales records
- **csv_uploads**: Upload tracking and error logging

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Data Management
- `GET /api/dashboard` - Dashboard statistics
- `GET /api/locations` - List all locations with stats
- `GET /api/inventory` - Get inventory items (with optional location filter)
- `PUT /api/inventory` - Update inventory levels
- `POST /api/csv/upload` - Process CSV sales data

## CSV Format Support

### Vendor A Format (iOS Vending Systems)
```csv
Location_ID,Product_Name,Scancode,Trans_Date,Price,Total_Amount
2.0_SW_02,Celsius Arctic,889392014,06/09/2025,3.50,3.82
```

### Vendor B Format (Cantaloupe Systems)
```csv
Site_Code,Item_Description,UPC,Sale_Date,Unit_Price,Final_Total
SW_02,Celsius Arctic Berry,889392014,2025-06-09,3.50,3.82
```

## Sample Data

Sample CSV files are provided in the `sample-data/` directory:
- `vendor-a-sample.csv` - Sample data in Vendor A format
- `vendor-b-sample.csv` - Sample data in Vendor B format

## Key Features Explained

### Automatic Format Detection
The system automatically detects which vendor format is being used based on the CSV headers and processes the data accordingly.

### Data Normalization
Different field names and date formats are normalized into a consistent internal schema:
- Location identifiers are unified
- Product information is standardized
- Date formats are converted to ISO format
- Price data is normalized to decimal format

### Inventory Management
- **Real-time Updates**: Sales data automatically reduces inventory levels
- **Stock Alerts**: Visual indicators for low stock and out-of-stock items
- **Location-based Tracking**: Each location maintains separate inventory
- **Manual Adjustments**: Operators can manually update stock levels

### Error Handling
- Invalid CSV formats are detected and reported
- Row-level errors are logged and displayed
- Failed transactions don't prevent successful ones from processing
- Comprehensive error reporting for troubleshooting

## Development

### Project Structure
```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   └── globals.css        # Global styles
├── components/            # Reusable components
├── contexts/              # React contexts
├── lib/                   # Utility functions
├── sample-data/           # Sample CSV files
└── supabase/
    └── migrations/        # Database migrations
```

### Adding New Features

1. **New API Endpoints**: Add to `app/api/`
2. **New Pages**: Add to `app/dashboard/`
3. **New Components**: Add to `components/`
4. **Database Changes**: Create new migration files

## Deployment

The application can be deployed to Vercel:

1. Push your code to a Git repository
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.