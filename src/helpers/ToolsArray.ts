/**
 * Change the position of an array element.
 * @param targetArray array concerned by changes
 * @param source index of the original position
 * @param target index of the new position in the array
 * @return Reorganized array
 */
 export function changeElementPosition(
    targetArray: any[],
    source: number,
    target: number
  ): any[] {
    let newArray = [...targetArray];
    const element = newArray.splice(source, 1)[0];
    newArray.splice(target, 0, element);
    return newArray;
  }
  