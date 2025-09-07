import { PosterSize, PosterSrcPipe } from './poster-src.pipe';

describe('PosterSrcPipe', () => {
  let pipe: PosterSrcPipe;

  // Test constants
  const baseImageUrl = 'https://image.tmdb.org/t/p/';
  const fallbackImageUrl = 'assets/no-poster-placeholder.svg';
  const mockPosterPath = '/abc123.jpg';
  const mockPosterPathWithoutSlash = 'def456.jpg';

  beforeEach(() => {
    pipe = new PosterSrcPipe();
  });

  describe('transform', () => {
    it('transform_Success', () => {
      // Arrange
      const inPosterPath = mockPosterPath;
      const inSize: PosterSize = 'w500';
      const inExpectedUrl = `${baseImageUrl}${inSize}${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should return complete TMDB image URL with specified size').toBe(inExpectedUrl);
    });

    it('transform_DefaultSize', () => {
      // Arrange
      const inPosterPath = mockPosterPath;
      const inExpectedUrl = `${baseImageUrl}w500${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath);

      // Assert
      expect(result).withContext('Should use w500 as default size when no size specified').toBe(inExpectedUrl);
    });

    it('transform_NullPosterPath', () => {
      // Arrange
      const inPosterPath: string | null = null;
      const inSize: PosterSize = 'w342';
      const inExpectedUrl = fallbackImageUrl;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should return fallback image when poster path is null').toBe(inExpectedUrl);
    });

    it('transform_EmptyStringPosterPath', () => {
      // Arrange
      const inPosterPath = '';
      const inSize: PosterSize = 'w185';
      const inExpectedUrl = fallbackImageUrl;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should return fallback image when poster path is empty string').toBe(inExpectedUrl);
    });

    it('transform_SmallestSize', () => {
      // Arrange
      const inPosterPath = mockPosterPath;
      const inSize: PosterSize = 'w92';
      const inExpectedUrl = `${baseImageUrl}${inSize}${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should generate URL with smallest size w92').toBe(inExpectedUrl);
    });

    it('transform_LargestSize', () => {
      // Arrange
      const inPosterPath = mockPosterPath;
      const inSize: PosterSize = 'w780';
      const inExpectedUrl = `${baseImageUrl}${inSize}${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should generate URL with largest size w780').toBe(inExpectedUrl);
    });

    it('transform_OriginalSize', () => {
      // Arrange
      const inPosterPath = mockPosterPath;
      const inSize: PosterSize = 'original';
      const inExpectedUrl = `${baseImageUrl}${inSize}${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should generate URL with original size').toBe(inExpectedUrl);
    });

    it('transform_PosterPathWithoutLeadingSlash', () => {
      // Arrange
      const inPosterPath = mockPosterPathWithoutSlash;
      const inSize: PosterSize = 'w500';
      const inExpectedUrl = `${baseImageUrl}${inSize}${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should handle poster path without leading slash').toBe(inExpectedUrl);
    });

    it('transform_AllValidSizes', () => {
      // Arrange
      const inPosterPath = mockPosterPath;
      const validSizes: PosterSize[] = ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'];

      validSizes.forEach(size => {
        // Arrange
        const inExpectedUrl = `${baseImageUrl}${size}${inPosterPath}`;

        // Act
        const result = pipe.transform(inPosterPath, size);

        // Assert
        expect(result).withContext(`Should generate correct URL for size ${size}`).toBe(inExpectedUrl);
      });
    });

    it('transform_InvalidSize', () => {
      // Arrange
      const inPosterPath = mockPosterPath;
      const inInvalidSize = 'w999' as PosterSize;
      const inExpectedUrl = `${baseImageUrl}w500${inPosterPath}`;
      const consoleSpy = spyOn(console, 'warn');

      // Act
      const result = pipe.transform(inPosterPath, inInvalidSize);

      // Assert
      expect(result).withContext('Should fallback to w500 when invalid size provided').toBe(inExpectedUrl);
      expect(consoleSpy)
        .withContext('Should log warning for invalid size')
        .toHaveBeenCalledWith('Invalid poster size "w999". Using default "w500". Valid sizes:', [
          'w92',
          'w154',
          'w185',
          'w342',
          'w500',
          'w780',
          'original',
        ]);
    });

    it('transform_InvalidSizeWithNullPosterPath', () => {
      // Arrange
      const inPosterPath: string | null = null;
      const inInvalidSize = 'w999' as PosterSize;
      const inExpectedUrl = fallbackImageUrl;

      // Act
      const result = pipe.transform(inPosterPath, inInvalidSize);

      // Assert
      expect(result)
        .withContext('Should return fallback image when poster path is null regardless of invalid size')
        .toBe(inExpectedUrl);
    });

    it('transform_WhitespacePosterPath', () => {
      // Arrange
      const inPosterPath = '   ';
      const inSize: PosterSize = 'w342';
      const inExpectedUrl = `${baseImageUrl}${inSize}${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should treat whitespace poster path as valid and generate URL').toBe(inExpectedUrl);
    });

    it('transform_SpecialCharactersPosterPath', () => {
      // Arrange
      const inPosterPath = '/special-characters_123!@#.jpg';
      const inSize: PosterSize = 'w154';
      const inExpectedUrl = `${baseImageUrl}${inSize}${inPosterPath}`;

      // Act
      const result = pipe.transform(inPosterPath, inSize);

      // Assert
      expect(result).withContext('Should handle poster path with special characters').toBe(inExpectedUrl);
    });
  });
});
