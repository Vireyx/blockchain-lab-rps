const pinataSDK = require('@pinata/sdk');
const fs = require('fs');
const path = require('path');

// ВСТАВЬТЕ ВАШИ КЛЮЧИ С PINATA!
const pinata = new pinataSDK('14745e4314a806c1b5e6', '6255695e7b8daccfe75f6f3cf4c2c2fc8a574f3101545eaeab82c8ee7f4fc801');

async function uploadImageToPinata(imagePath) {
  try {
    const readableStreamForFile = fs.createReadStream(imagePath);
    const fileName = path.basename(imagePath);
    
    const result = await pinata.pinFileToIPFS(readableStreamForFile, {
      pinataMetadata: {
        name: fileName,
      }
    });
    
    console.log(`✅ Изображение загружено: ${result.IpfsHash}`);
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Ошибка загрузки изображения:', error);
    throw error;
  }
}

async function uploadMetadataToPinata(name, description, imageIpfsHash, tokenId) {
  try {
    const metadata = {
      name: name,
      description: description,
      image: `ipfs://${imageIpfsHash}`,
      attributes: [
        { trait_type: "Category", value: "Educational" },
        { trait_type: "Type", value: "Computer Science" },
        { trait_type: "Number", value: tokenId.toString() },
        { trait_type: "Format", value: "Infographic" }
      ],
      external_url: "https://your-educational-nft.com",
      compiler: "Educational NFT Collection"
    };
    
    const result = await pinata.pinJSONToIPFS(metadata);
    console.log(`✅ Метаданные загружены: ${result.IpfsHash}`);
    return result.IpfsHash;
  } catch (error) {
    console.error('❌ Ошибка загрузки метаданных:', error);
    throw error;
  }
}

async function main() {
  const imagesDir = path.join(__dirname, '..', 'images');
  
  // Найти все PNG и JPG файлы
  const files = fs.readdirSync(imagesDir).filter(f => 
    f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg')
  );
  
  if (files.length === 0) {
    console.log('❌ В папке images/ нет файлов PNG или JPG');
    return;
  }
  
  console.log(`📤 Загрузка ${files.length} NFT на Pinata...\n`);
  
  const uploadedNFTs = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const tokenId = i + 1;
    const imagePath = path.join(imagesDir, file);
    
    console.log(`\n🎨 Обработка ${file} (NFT #${tokenId})...`);
    
    try {
      // Загружаем изображение
      const imageHash = await uploadImageToPinata(imagePath);
      
      // Создаем имя и описание на основе имени файла
      const names = {
        'processes.png': 'Процессы в ОС',
        'memory.png': 'Управление памятью',
        'filesystem.png': 'Файловая система',
        'networks.png': 'Компьютерные сети',
        'algorithms.png': 'Алгоритмы и структуры данных'
      };
      
      const descriptions = {
        'processes.png': 'Лабораторная работа: Исследование работы процессов в операционной системе',
        'memory.png': 'Управление памятью в ОС: стек, куча, распределение памяти',
        'filesystem.png': 'Файловая система: дерево каталогов, права доступа, inodes',
        'networks.png': 'Компьютерные сети: OSI модель, TCP/IP, передача данных',
        'algorithms.png': 'Алгоритмы и структуры данных: сортировка, деревья, графы, сложность'
      };
      
      const fileName = file.toLowerCase();
      const name = names[fileName] || `Educational NFT #${tokenId}`;
      const description = descriptions[fileName] || `Образовательный NFT токен #${tokenId}`;
      
      // Загружаем метаданные
      const metadataHash = await uploadMetadataToPinata(
        name,
        description,
        imageHash,
        tokenId
      );
      
      uploadedNFTs.push({
        id: tokenId.toString(),
        fileName: file,
        name: name,
        tokenURI: `ipfs://${metadataHash}`
      });
      
      console.log(`✅ NFT #${tokenId} загружен успешно!`);
      
    } catch (error) {
      console.error(`❌ Ошибка при загрузке ${file}:`, error);
    }
  }
  
  console.log('\n===========================================');
  console.log('✅ ВСЕ NFT ЗАГРУЖЕНЫ НА PINATA!');
  console.log('===========================================\n');
  console.log('📋 Token URIs:');
  uploadedNFTs.forEach(nft => {
    console.log(`#${nft.id} - ${nft.name}:`);
    console.log(`   ${nft.tokenURI}\n`);
  });
  
  // Сохраняем в файл для удобства
  const outputPath = path.join(__dirname, 'uploaded-nfts.json');
  fs.writeFileSync(outputPath, JSON.stringify(uploadedNFTs, null, 2));
  console.log(`💾 Данные сохранены в: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });