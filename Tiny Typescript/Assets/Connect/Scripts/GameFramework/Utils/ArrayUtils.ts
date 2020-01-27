namespace game {
	/** Utility class for various array functions */
	export class ArrayUtils {
		/** Removes and returns the first element of an array of generic type */
		static PullFirstElementFromArray<T>(array: Array<T>): T {
			let result: Array<T> = array;
			let element = result.shift();
			array = result;
			return element;
		}

		/** Removes and returns the last element of an array of generic type */
		static PullLastElementFromArray<T>(array: Array<T>): T {
			let result: Array<T> = array;
			let element = result.pop();
			array = result;
			return element;
		}

		/** Returns a random element of an array of generic type */
		static GetRandomElement<T>(array: Array<T>): T {
			return array[MathUtils.RandomRangeRounded(array.length - 1)];
		}

		/** Copies immutable array, adds specified element to it and returns the new array */
		static AddToArray<T>(original: T[], newElement: T): T[] {
			let result: Array<T> = original;
			result.push(newElement);
			return result;
		}

		/** Removes the item at the provided index of the array and returns it. */
		public static RemoveFromArray<T>(array: Array<T>, index: number): T {
			if (index >= array.length) {
				console.error("The array does not contain the provided index.");
				return null;
			}
			let indexItem = array[index];
			let lastItem = array.pop();
			let nextItem = null;
			for (let i = 0; i < array.length; i++) {
				if (i < index) continue;
				if (i + 1 === array.length) {
					array[i] = lastItem;
					break;
				}
				nextItem = array[i + 1];
				array[i] = nextItem;
			}
			return indexItem;
		}

		/** Returns the array without the elements at provided indices. 
		 * Remaining elements may have shifted index to fill up holes in the array.
		 * 
		 * @param indices array of indices to remove from the array*/
		static RemoveIndicesFromArray<T>(array: Array<T>, indices: number[]): Array<T> {
			let result = new Array<T>();
			for (let i = 0; i < array.length; i++) {
				const element = array[i];
				if (indices.indexOf(i) === -1) {
					result.push(element);
				}
			}
			return result;
		}
	}
}
