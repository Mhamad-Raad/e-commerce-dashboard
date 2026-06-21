-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "bodyCkb" TEXT,
ADD COLUMN     "excerptCkb" TEXT,
ADD COLUMN     "titleCkb" TEXT;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "descriptionCkb" TEXT,
ADD COLUMN     "nameAr" TEXT,
ADD COLUMN     "nameCkb" TEXT;

-- AlterTable
ALTER TABLE "HomeSection" ADD COLUMN     "titleCkb" TEXT;

-- AlterTable
ALTER TABLE "HomeSectionItem" ADD COLUMN     "badgeAr" TEXT,
ADD COLUMN     "badgeCkb" TEXT,
ADD COLUMN     "ctaLabelAr" TEXT,
ADD COLUMN     "ctaLabelCkb" TEXT,
ADD COLUMN     "labelAr" TEXT,
ADD COLUMN     "labelCkb" TEXT,
ADD COLUMN     "subtitleAr" TEXT,
ADD COLUMN     "subtitleCkb" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "descriptionCkb" TEXT,
ADD COLUMN     "nameAr" TEXT,
ADD COLUMN     "nameCkb" TEXT;

-- AlterTable
ALTER TABLE "Store" ADD COLUMN     "descriptionAr" TEXT,
ADD COLUMN     "descriptionCkb" TEXT,
ADD COLUMN     "nameAr" TEXT,
ADD COLUMN     "nameCkb" TEXT;

